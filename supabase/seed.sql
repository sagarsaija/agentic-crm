-- Seed data for testing the Agentic CRM

-- Insert sample companies
INSERT INTO companies (id, name, domain, industry, size, location, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Acme Corporation', 'acme.com', 'Technology', '50-200', 'San Francisco, CA', 'Enterprise software solutions'),
  ('550e8400-e29b-41d4-a716-446655440002', 'TechStart Inc', 'techstart.io', 'SaaS', '10-50', 'Austin, TX', 'Modern CRM platform');

-- Insert sample leads
INSERT INTO leads (
  id, first_name, last_name, email, title, company_id, company_name, 
  status, score, source, location
) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001', 
    'John', 
    'Doe', 
    'john@acme.com', 
    'VP of Sales', 
    '550e8400-e29b-41d4-a716-446655440001',
    'Acme Corporation',
    'new',
    75,
    'manual',
    'San Francisco, CA'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002', 
    'Jane', 
    'Smith', 
    'jane@techstart.io', 
    'Head of Marketing', 
    '550e8400-e29b-41d4-a716-446655440002',
    'TechStart Inc',
    'qualified',
    85,
    'inbound',
    'Austin, TX'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003', 
    'Bob', 
    'Johnson', 
    'bob@example.com', 
    'CEO', 
    NULL,
    'Johnson Consulting',
    'contacted',
    60,
    'agent_discovery',
    'New York, NY'
  );

-- Insert sample activities
INSERT INTO activities (lead_id, type, subject, content) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'note',
    'Initial contact',
    'Reached out via LinkedIn. Interested in our product.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'email_sent',
    'Follow-up email',
    'Sent product demo information and pricing.'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440003',
    'call',
    'Discovery call',
    'Had a 30-minute call to understand their needs.'
  );

-- Insert sample agent
INSERT INTO agents (id, name, type, description) VALUES
  (
    '750e8400-e29b-41d4-a716-446655440001',
    'Lead Enrichment Agent',
    'enrichment',
    'Enriches lead data with company information and social profiles'
  );

