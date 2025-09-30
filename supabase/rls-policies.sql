-- Row Level Security (RLS) Configuration
-- Enable RLS and create policies for all tables

-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allow all operations)
-- Note: These are permissive policies for MVP development
-- In production, implement more restrictive role-based policies

-- Companies policies
CREATE POLICY "Allow authenticated users full access to companies"
  ON companies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Leads policies
CREATE POLICY "Allow authenticated users full access to leads"
  ON leads FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Activities policies
CREATE POLICY "Allow authenticated users full access to activities"
  ON activities FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Workflows policies
CREATE POLICY "Allow authenticated users full access to workflows"
  ON workflows FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Workflow runs policies
CREATE POLICY "Allow authenticated users full access to workflow_runs"
  ON workflow_runs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Agents policies
CREATE POLICY "Allow authenticated users full access to agents"
  ON agents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Agent runs policies
CREATE POLICY "Allow authenticated users full access to agent_runs"
  ON agent_runs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email templates policies
CREATE POLICY "Allow authenticated users full access to email_templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email campaigns policies
CREATE POLICY "Allow authenticated users full access to email_campaigns"
  ON email_campaigns FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Integrations policies
CREATE POLICY "Allow authenticated users full access to integrations"
  ON integrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Notes:
-- 1. Service role automatically bypasses RLS (handled by Supabase)
-- 2. Anon key respects RLS policies (used in client-side code)
-- 3. For production, consider implementing:
--    - Owner-based policies (users can only see their own leads)
--    - Team-based policies (users can see team leads)
--    - Role-based policies (admin, manager, sales rep)

-- Example of a more restrictive policy (for future use):
-- CREATE POLICY "Users can only view their own leads"
--   ON leads FOR SELECT
--   TO authenticated
--   USING (owner_id = auth.uid());

