-- Enable RLS on application tables
ALTER TABLE "entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entries" FORCE ROW LEVEL SECURITY;
ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "milestones" FORCE ROW LEVEL SECURITY;

-- Create policies for "entries"
-- We use a custom session variable 'app.current_user_id'
CREATE POLICY entries_isolation_policy ON "entries"
    FOR ALL
    TO public
    USING (user_id = current_setting('app.current_user_id', true))
    WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Create policies for "milestones"
CREATE POLICY milestones_isolation_policy ON "milestones"
    FOR ALL
    TO public
    USING (user_id = current_setting('app.current_user_id', true))
    WITH CHECK (user_id = current_setting('app.current_user_id', true));
