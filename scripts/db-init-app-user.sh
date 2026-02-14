#!/bin/bash
# Runs once on first PostgreSQL container initialization (docker-entrypoint-initdb.d).
# Creates the restricted app user that the application uses at runtime.
# The admin user (POSTGRES_USER) is already created by the Docker image itself.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create app user if it doesn't exist yet
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${APP_USER}') THEN
            CREATE USER "${APP_USER}" WITH
                PASSWORD '${APP_PASSWORD}'
                NOCREATEDB
                NOCREATEROLE
                NOSUPERUSER;
            RAISE NOTICE 'Created app user: ${APP_USER}';
        ELSE
            RAISE NOTICE 'App user already exists: ${APP_USER}';
        END IF;
    END
    \$\$;

    -- Allow app user to connect to the database
    GRANT CONNECT ON DATABASE "$POSTGRES_DB" TO "${APP_USER}";

    -- Allow app user to use the public schema
    GRANT USAGE ON SCHEMA public TO "${APP_USER}";

    -- Grant DML on all existing tables (covers tables created before this script)
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${APP_USER}";

    -- Grant sequence usage for auto-generated IDs
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "${APP_USER}";

    -- Ensure future tables created by the admin user also get these grants automatically
    ALTER DEFAULT PRIVILEGES FOR ROLE "$POSTGRES_USER" IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${APP_USER}";

    ALTER DEFAULT PRIVILEGES FOR ROLE "$POSTGRES_USER" IN SCHEMA public
        GRANT USAGE, SELECT ON SEQUENCES TO "${APP_USER}";
EOSQL

echo "[db-init] App user '${APP_USER}' ready."
