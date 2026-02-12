# PostgreSQL 18 Upgrade Deployment Failure - Analysis & Solutions

## Issue Summary

**Problem:** Coolify deployment failing after PR #43 upgraded PostgreSQL from 17-alpine to 18-alpine.

**Root Cause:** PostgreSQL major version upgrades (17 → 18) require data migration. PostgreSQL 18 **cannot start** with a data directory created by PostgreSQL 17 due to incompatible system catalog formats.

**Affected:** Production deployment on Coolify with persistent volume containing PostgreSQL 17 data.

---

## Technical Analysis

### What Changed in PR #43

```diff
- image: postgres:17-alpine@sha256:bb377b7239d2774ac8cc76f481596ce96c5a6b5e9d141f6d0a0ee371a6e7c0f2
+ image: postgres:18-alpine@sha256:aa6eb304ddb6dd26df23d05db4e5cb05af8951cda3e0dc57731b771e0ef4ab29
```

Files modified:
- `docker-compose.yml` (production deployment)
- `.github/workflows/pr-validation.yml` (CI - no persistent data, works fine)
- `.github/workflows/code-coverage.yml` (CI - no persistent data, works fine)

### Why CI Tests Passed But Production Failed

✅ **CI Workflows:** Fresh PostgreSQL container each run (no existing data) → Works fine
❌ **Production:** Persistent volume with PostgreSQL 17 data → PostgreSQL 18 cannot read it

### Error Symptoms

When PostgreSQL 18 tries to start with a PostgreSQL 17 data directory:

```
FATAL:  database files are incompatible with server
DETAIL:  The data directory was initialized by PostgreSQL version 17,
         which is not compatible with this version 18.0.
```

Or the container repeatedly restarts/crashes without error logs if configured to fail silently.

---

## Solutions (3 Options)

### 🎯 **Option 1: Quick Rollback** (Recommended for Immediate Recovery)

**Time:** 5 minutes
**Risk:** Low
**Data Loss:** None

Revert to PostgreSQL 17 while planning proper migration.

#### Steps:

1. **Create rollback PR:**

```bash
git checkout -b fix/rollback-postgres-17
```

2. **Edit `docker-compose.yml`:**

```yaml
services:
  db:
    image: postgres:17-alpine@sha256:bb377b7239d2774ac8cc76f481596ce96c5a6b5e9d141f6d0a0ee371a6e7c0f2
    # ... rest of config unchanged
```

3. **Commit and push:**

```bash
git add docker-compose.yml
git commit -m "fix(db): rollback to PostgreSQL 17 for data compatibility

- Reverts postgres:18-alpine → postgres:17-alpine
- PostgreSQL 18 cannot read PostgreSQL 17 data directories
- Requires proper migration strategy (backup/restore or pg_upgrade)
- Production deployment has persistent volume with PG 17 data

Related: PR #43

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin fix/rollback-postgres-17
```

4. **Create PR and merge immediately**

5. **Coolify will auto-deploy** PostgreSQL 17 and database will start successfully

**Result:** Service restored, data intact, buys time for proper migration.

---

### 🔧 **Option 2: Backup & Restore Migration** (Recommended for Production)

**Time:** 30-60 minutes (includes testing)
**Risk:** Medium (requires careful execution)
**Data Loss:** None (if backup succeeds)

Proper migration path using PostgreSQL dump/restore.

#### Prerequisites:

- Access to Coolify dashboard or server SSH
- Ability to execute commands in PostgreSQL 17 container
- Backup storage location

#### Steps:

1. **First, rollback to PostgreSQL 17** (Option 1) to get service running

2. **Create full database backup:**

```bash
# SSH into Coolify server or use Coolify CLI
# Find the PostgreSQL container name
docker ps | grep postgres

# Create backup (replace CONTAINER_NAME)
docker exec -t CONTAINER_NAME pg_dumpall -U postgres > journal_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup file is not empty
ls -lh journal_backup_*.sql
```

3. **Create migration script** (`scripts/migrate-postgres-18.sh`):

```bash
#!/bin/bash
set -e

echo "=== PostgreSQL 17 → 18 Migration Script ==="
echo "⚠️  This will DESTROY existing data and restore from backup"
echo ""
read -p "Have you created a backup? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted. Please create backup first."
  exit 1
fi

read -p "Enter backup file path: " BACKUP_FILE

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo ""
echo "Step 1: Updating docker-compose.yml to PostgreSQL 18..."
# (Already done by PR #43 on main branch)

echo ""
echo "Step 2: Stopping containers..."
docker compose down

echo ""
echo "Step 3: DESTROYING PostgreSQL 17 data volume..."
docker volume rm journal_postgres_data || true

echo ""
echo "Step 4: Starting PostgreSQL 18 (fresh)..."
docker compose up -d db

echo ""
echo "Step 5: Waiting for PostgreSQL 18 to initialize..."
sleep 10

echo ""
echo "Step 6: Restoring backup to PostgreSQL 18..."
docker exec -i $(docker compose ps -q db) psql -U postgres < "$BACKUP_FILE"

echo ""
echo "Step 7: Starting all services..."
docker compose up -d

echo ""
echo "✅ Migration complete!"
echo "🔍 Verify with: docker compose logs db"
echo "🔍 Test connection: docker exec -it $(docker compose ps -q db) psql -U postgres -d journal"
```

4. **Execute on Coolify server:**

```bash
# Upload backup and script to server
scp journal_backup_*.sql user@coolify-server:/tmp/
scp scripts/migrate-postgres-18.sh user@coolify-server:/tmp/

# SSH into server
ssh user@coolify-server

# Navigate to deployment directory
cd /path/to/journal-deployment

# Make script executable
chmod +x /tmp/migrate-postgres-18.sh

# Run migration
/tmp/migrate-postgres-18.sh
```

5. **Verify migration:**

```bash
# Check database version
docker exec -it $(docker compose ps -q db) psql -U postgres -c "SELECT version();"

# Verify tables exist
docker exec -it $(docker compose ps -q db) psql -U postgres -d journal -c "\dt"

# Verify row counts
docker exec -it $(docker compose ps -q db) psql -U postgres -d journal -c "SELECT COUNT(*) FROM entries;"
docker exec -it $(docker compose ps -q db) psql -U postgres -d journal -c "SELECT COUNT(*) FROM user_profiles;"
```

6. **Update repository** (already done by PR #43, just pull):

```bash
git pull origin main  # PostgreSQL 18 config already merged
```

**Result:** Clean PostgreSQL 18 installation with all data restored.

---

### 🏗️ **Option 3: In-Place Upgrade with pg_upgrade** (Advanced)

**Time:** 1-2 hours (complex setup)
**Risk:** High (requires careful execution)
**Data Loss:** None (if successful)

Uses PostgreSQL's built-in `pg_upgrade` tool for in-place upgrade.

#### Challenges in Docker Environment:

- Requires both PostgreSQL 17 AND 18 binaries in same container
- Need temporary container with special setup
- More error-prone than backup/restore
- Not recommended for production without testing

#### High-Level Steps:

1. Create custom Dockerfile with both PG 17 and 18
2. Mount existing data volume as read-only
3. Run pg_upgrade to migrate data in-place
4. Swap volumes and restart

**Recommendation:** Use Option 2 (Backup & Restore) instead. It's simpler and more reliable.

---

## Recommended Action Plan

### Immediate (Next 10 minutes):

1. ✅ **Execute Option 1**: Rollback to PostgreSQL 17
2. ✅ Verify service is restored and users can access the app
3. ✅ Create backup of PostgreSQL 17 data

### Short-term (Next 1-2 days):

4. ✅ **Execute Option 2**: Backup & Restore migration to PostgreSQL 18
5. ✅ Test thoroughly in preview environment first (if available)
6. ✅ Schedule maintenance window for production migration
7. ✅ Monitor for 24 hours after migration

### Long-term Prevention:

8. ✅ Update Renovate config to **block auto-merge for Docker image major updates**
9. ✅ Add PostgreSQL version check to deployment validation
10. ✅ Document database migration procedures

---

## Preventing Future Issues

### Update Renovate Configuration

Edit `renovate.json` to prevent auto-merge of Docker image major versions:

```json
{
  "packageRules": [
    {
      "description": "Block auto-merge for Docker image major version updates",
      "matchDatasources": ["docker"],
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["dependencies", "major-update", "manual-review-required"]
    },
    {
      "description": "PostgreSQL requires manual migration on major updates",
      "matchPackageNames": ["postgres"],
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["database", "migration-required", "manual-review-required"],
      "prPriority": 10,
      "reviewers": ["team:backend"]
    }
  ]
}
```

### Add Database Version Check

Create `scripts/check-postgres-compatibility.ts`:

```typescript
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function checkPostgresCompatibility() {
  const result = await db.execute(sql`SELECT version();`);
  const version = result.rows[0].version;

  const majorVersion = parseInt(version.match(/PostgreSQL (\d+)/)?.[1] || '0');

  if (majorVersion < 17) {
    console.error('❌ PostgreSQL version too old. Minimum: 17, Found:', majorVersion);
    process.exit(1);
  }

  if (majorVersion > 18) {
    console.warn('⚠️  PostgreSQL version newer than tested version 18. Found:', majorVersion);
  }

  console.log('✅ PostgreSQL version compatible:', version);
}

checkPostgresCompatibility();
```

### Add to CI/CD Pipeline

Update `server/package.json`:

```json
{
  "scripts": {
    "db:check-version": "tsx src/scripts/check-postgres-compatibility.ts",
    "prestart": "npm run db:check-version"
  }
}
```

---

## Testing Checklist

After migration to PostgreSQL 18:

- [ ] Database container starts successfully
- [ ] All tables present (`\dt` in psql)
- [ ] Row counts match backup
- [ ] Authentication works (sign in/sign up)
- [ ] Entry creation works
- [ ] Entry retrieval works
- [ ] RLS policies enforced
- [ ] No error logs in server
- [ ] Performance acceptable
- [ ] Backup/restore procedure tested

---

## PostgreSQL 17 vs 18 - What Changed?

**Major features in PostgreSQL 18:**
- Improved query performance
- Better JSON/JSONB handling
- Enhanced partitioning
- Security improvements

**Breaking changes:**
- System catalog format (requires migration)
- Some deprecated features removed
- Configuration parameter changes

**References:**
- [PostgreSQL 18 Release Notes](https://www.postgresql.org/docs/18/release-18.html)
- [pg_upgrade Documentation](https://www.postgresql.org/docs/current/pgupgrade.html)

---

## Support & Escalation

If issues persist after rollback:

1. Check Coolify logs: `docker compose logs db`
2. Check server logs: `docker compose logs server`
3. Verify volume mount: `docker volume inspect journal_postgres_data`
4. Check Coolify deployment logs in dashboard
5. Verify environment variables in Coolify

**Emergency contacts:**
- Coolify support: [coolify.io/docs](https://coolify.io/docs)
- PostgreSQL community: [postgresql.org/support](https://www.postgresql.org/support/)

---

## Summary

| Option | Time | Risk | Recommended For |
|--------|------|------|-----------------|
| **Option 1: Rollback** | 5 min | Low | Immediate service restoration |
| **Option 2: Backup & Restore** | 30-60 min | Medium | Production migration |
| **Option 3: pg_upgrade** | 1-2 hrs | High | Advanced users only |

**Recommended path:** Option 1 immediately, then Option 2 during planned maintenance.
