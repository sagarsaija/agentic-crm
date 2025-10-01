-- ============================================================================
-- AGENTIC CRM - COMPREHENSIVE DEMO DATA
-- ============================================================================
-- This file contains rich, realistic demo data for showcasing the CRM
-- Run this AFTER the main seed.sql for enhanced demonstrations
-- ============================================================================

-- Clear existing demo data (optional - comment out if you want to keep existing)
-- DELETE FROM activities WHERE lead_id IN (SELECT id FROM leads);
-- DELETE FROM leads;
-- DELETE FROM companies WHERE id NOT IN (SELECT DISTINCT company_id FROM leads WHERE company_id IS NOT NULL);

-- ============================================================================
-- COMPANIES - Diverse Industries
-- ============================================================================

INSERT INTO companies (id, name, domain, industry, size, revenue, location, description, linkedin_url, tech_stack, recent_news) VALUES

-- Tech Companies
('550e8400-e29b-41d4-a716-446655440010', 
 'CloudScale Technologies', 
 'cloudscale.io', 
 'Cloud Infrastructure', 
 '250-500', 
 '$50M-$100M', 
 'San Francisco, CA',
 'Leading provider of scalable cloud infrastructure solutions for enterprises',
 'https://linkedin.com/company/cloudscale',
 '["AWS", "Kubernetes", "Docker", "Terraform", "Python"]',
 '["Raised $25M Series B", "Expanded to EMEA market"]'),

('550e8400-e29b-41d4-a716-446655440011',
 'DataFlow Analytics',
 'dataflow.com',
 'Data Analytics',
 '50-100',
 '$10M-$25M',
 'Austin, TX',
 'Real-time data analytics platform for marketing teams',
 'https://linkedin.com/company/dataflow',
 '["React", "Node.js", "PostgreSQL", "Redis", "Apache Kafka"]',
 '["Launched new ML features", "150% YoY growth"]'),

-- SaaS Companies
('550e8400-e29b-41d4-a716-446655440012',
 'TeamCollab Pro',
 'teamcollab.io',
 'Project Management',
 '100-250',
 '$25M-$50M',
 'Remote (HQ: Seattle, WA)',
 'Next-generation project management and collaboration platform',
 'https://linkedin.com/company/teamcollab',
 '["Vue.js", "Ruby on Rails", "MongoDB", "Elasticsearch"]',
 '["10,000+ customers milestone", "SOC 2 Type II certified"]'),

-- E-commerce
('550e8400-e29b-41d4-a716-446655440013',
 'ShopSmart Retail',
 'shopsmart.com',
 'E-commerce',
 '500-1000',
 '$100M-$500M',
 'New York, NY',
 'Omnichannel retail platform with AI-powered personalization',
 'https://linkedin.com/company/shopsmart',
 '["Shopify Plus", "React Native", "Java", "BigQuery"]',
 '["Acquired competitor", "Expanding to Asia Pacific"]'),

-- FinTech
('550e8400-e29b-41d4-a716-446655440014',
 'FinFlow Payments',
 'finflow.io',
 'Financial Technology',
 '100-250',
 '$25M-$50M',
 'London, UK',
 'Modern payment processing for global businesses',
 'https://linkedin.com/company/finflow',
 '["Node.js", "Go", "Kubernetes", "PostgreSQL", "Stripe API"]',
 '["PCI DSS Level 1 certified", "Processing $1B+ annually"]');

-- ============================================================================
-- LEADS - Diverse Roles and Scenarios
-- ============================================================================

INSERT INTO leads (
  id, first_name, last_name, email, phone, title, company_id, company_name,
  status, score, source, linkedin_url, location, research_summary,
  pain_points, buying_signals, personal_notes
) VALUES

-- High-Value Qualified Leads
('650e8400-e29b-41d4-a716-446655440020',
 'Sarah', 'Chen', 'sarah.chen@cloudscale.io', '+1-415-555-0101',
 'VP of Engineering', '550e8400-e29b-41d4-a716-446655440010', 'CloudScale Technologies',
 'qualified', 92,
 'inbound', 'https://linkedin.com/in/sarah-chen', 'San Francisco, CA',
 'Sarah is leading CloudScale''s infrastructure modernization initiative. The company is evaluating CRM solutions to better manage their enterprise sales pipeline. She has a strong technical background and values automation and AI-driven insights.',
 '["Manual lead tracking causing data inconsistencies", "Sales and engineering teams not aligned", "Need better visibility into customer journey"]',
 '["Mentioned budget approved for Q1", "Looking for solution within 30 days", "Already using Salesforce but seeking modern alternative"]',
 'Very engaged during initial call. Excited about AI features. Decision maker with budget authority.'),

('650e8400-e29b-41d4-a716-446655440021',
 'Michael', 'Rodriguez', 'm.rodriguez@dataflow.com', '+1-512-555-0202',
 'Head of Revenue Operations', '550e8400-e29b-41d4-a716-446655440011', 'DataFlow Analytics',
 'qualified', 88,
 'conference', 'https://linkedin.com/in/michael-rodriguez', 'Austin, TX',
 'Michael is scaling DataFlow''s RevOps function. He''s looking for a modern CRM that can integrate with their data warehouse and provide real-time insights. Strong interest in AI-powered lead scoring.',
 '["Current CRM lacks automation capabilities", "Spending 10+ hours/week on manual data entry", "Need better integration with data stack"]',
 '["Has existing vendor contracts expiring in 60 days", "Mentioned pain with current solution multiple times", "Asked about pricing and implementation timeline"]',
 'Met at SaaStr conference. Very technical. Wants to see API documentation.'),

-- Mid-Funnel Leads
('650e8400-e29b-41d4-a716-446655440022',
 'Emily', 'Thompson', 'emily.t@teamcollab.io', '+1-206-555-0303',
 'Director of Sales', '550e8400-e29b-41d4-a716-446655440012', 'TeamCollab Pro',
 'researching', 75,
 'linkedin', 'https://linkedin.com/in/emily-thompson', 'Seattle, WA',
 'Emily is researching CRM options for TeamCollab''s growing sales team. The company is transitioning from spreadsheets to a proper CRM system. Looking for something that''s easy to adopt with minimal training required.',
 '["Using spreadsheets and losing deals in the cracks", "No centralized view of customer interactions", "Team resistance to complex tools"]',
 '["Downloaded whitepaper on modern CRM strategies", "Attended webinar last week", "Asked to be added to email list"]',
 'Early stage but high potential. Company growing fast. May need to wait for next quarter budget.'),

('650e8400-e29b-41d4-a716-446655440023',
 'David', 'Kim', 'david.kim@shopsmart.com', '+1-212-555-0404',
 'CTO', '550e8400-e29b-41d4-a716-446655440013', 'ShopSmart Retail',
 'researching', 70,
 'referral', 'https://linkedin.com/in/david-kim-tech', 'New York, NY',
 'David was referred by a mutual connection. ShopSmart is evaluating CRM solutions as part of their digital transformation initiative. He''s focused on technical architecture and API capabilities.',
 '["Need better customer data unification", "Current system doesn''t scale with growth", "Want more sophisticated automation"]',
 '["Referred by existing customer", "Has budget allocated for digital transformation", "Timeline is flexible but wants to move in 2025"]',
 'Referred by John at CloudScale. Very thorough evaluation process. Needs buy-in from CMO.'),

-- Early Stage Leads  
('650e8400-e29b-41d4-a716-446655440024',
 'Jessica', 'Martinez', 'j.martinez@finflow.io', '+44-20-5555-0505',
 'Sales Operations Manager', '550e8400-e29b-41d4-a716-446655440014', 'FinFlow Payments',
 'nurturing', 55,
 'content', 'https://linkedin.com/in/jessica-martinez-ops', 'London, UK',
 'Jessica discovered us through content marketing. FinFlow is in early stages of building out their sales operations function. Currently using basic tools but recognizing need for more sophisticated solution.',
 '["Manual reporting taking up significant time", "No clear visibility into pipeline health", "Struggling with international team coordination"]',
 '["Downloaded multiple resources", "Engaged with email campaigns", "Works in high-growth company"]',
 'Very engaged with content. International - need to consider timezone for calls. Growing company.'),

-- New/Unqualified Leads
('650e8400-e29b-41d4-a716-446655440025',
 'Robert', 'Johnson', 'rob.j@example-startup.com', '+1-415-555-0606',
 'Founder', NULL, 'Startup Co',
 'new', 45,
 'organic', 'https://linkedin.com/in/robert-johnson-founder', 'San Francisco, CA',
 NULL, NULL, NULL,
 'Signed up for trial. Early-stage startup. May not have budget yet.'),

('650e8400-e29b-41d4-a716-446655440026',
 'Amanda', 'White', 'amanda.white@techcorp.example', '+1-650-555-0707',
 'Sales Representative', NULL, 'TechCorp Solutions',
 'new', 40,
 'event', NULL, 'Palo Alto, CA',
 NULL, NULL, NULL,
 'Met briefly at event. Collected business card. Need to follow up.');

-- ============================================================================
-- ACTIVITIES - Realistic Interaction History
-- ============================================================================

INSERT INTO activities (lead_id, type, subject, content, direction, metadata) VALUES

-- Sarah Chen (High-Value Qualified)
('650e8400-e29b-41d4-a716-446655440020', 'email', 'Initial Discovery Call Scheduled',
 'Sarah responded positively to outreach. Discovery call scheduled for next Tuesday.',
 'inbound', '{"opened_email": true, "clicked_links": 3}'),

('650e8400-e29b-41d4-a716-446655440020', 'call', 'Discovery Call - Strong Fit',
 'Excellent 45-minute discovery call. Sarah confirmed pain points around manual processes and team alignment. Budget approved for Q1. Next steps: Product demo scheduled.',
 'outbound', '{"duration_minutes": 45, "sentiment": "positive", "next_action": "demo"}'),

('650e8400-e29b-41d4-a716-446655440020', 'meeting', 'Product Demo Completed',
 'Comprehensive demo with Sarah and her team (3 people). Strong interest in AI features and workflow automation. Requested custom pricing for 50 users.',
 'outbound', '{"attendees": 3, "questions_asked": 12, "engagement_level": "high"}'),

-- Michael Rodriguez (Qualified)
('650e8400-e29b-41d4-a716-446655440021', 'note', 'Met at SaaStr Conference',
 'Connected with Michael at SaaStr. He expressed frustration with current CRM limitations. Exchanged contact info and scheduled follow-up call.',
 'outbound', '{"event": "SaaStr Annual", "booth_visit": true}'),

('650e8400-e29b-41d4-a716-446655440021', 'email', 'Follow-up: Technical Documentation',
 'Sent Michael API documentation and integration guide as requested. He wants to evaluate technical fit before commercial discussions.',
 'outbound', '{"attachments": ["api-docs.pdf", "integration-guide.pdf"]}'),

('650e8400-e29b-41d4-a716-446655440021', 'agent_action', 'Lead Enrichment Completed',
 'AI agent enriched lead profile with research summary and insights.',
 NULL, '{"agent": "lead-enrichment", "timestamp": "2025-10-01T10:30:00Z"}'),

-- Emily Thompson (Mid-Funnel)
('650e8400-e29b-41d4-a716-446655440022', 'form_submission', 'Whitepaper Download: Modern CRM Strategies',
 'Emily downloaded whitepaper "10 Strategies for Scaling Your Sales Team with Modern CRM".',
 'inbound', '{"resource": "whitepaper-modern-crm", "source_page": "/resources"}'),

('650e8400-e29b-41d4-a716-446655440022', 'email', 'Nurture Sequence: Welcome Email',
 'Sent welcome email with getting started resources and case studies.',
 'outbound', '{"template": "welcome-nurture", "opened": true, "clicked": false}'),

('650e8400-e29b-41d4-a716-446655440022', 'webinar', 'Attended: Implementing Your First CRM',
 'Emily attended our implementation webinar. Asked two questions about team adoption.',
 'inbound', '{"webinar_id": "impl-101", "attendance_minutes": 55, "questions": 2}'),

-- David Kim (Researching)
('650e8400-e29b-41d4-a716-446655440023', 'note', 'Referral from CloudScale',
 'Warm referral from Sarah Chen at CloudScale Technologies. David is evaluating options for digital transformation project.',
 'inbound', '{"referrer": "Sarah Chen", "referrer_company": "CloudScale Technologies"}'),

('650e8400-e29b-41d4-a716-446655440023', 'email', 'Introduction: Referred by Sarah Chen',
 'Sent personalized introduction email mentioning Sarah''s referral and including relevant case studies.',
 'outbound', '{"opened": true, "clicked": true, "response": "pending"}');

-- ============================================================================
-- AGENTS - Sample Agent Definitions
-- ============================================================================

-- Add more agent types for demo purposes
INSERT INTO agents (id, name, type, description, model, temperature, is_active, config) VALUES

('750e8400-e29b-41d4-a716-446655440001',
 'Email Response Generator',
 'email',
 'Generates personalized email responses based on lead context',
 'gpt-4o-mini',
 0.7,
 true,
 '{"max_length": 500, "tone": "professional", "include_call_to_action": true}'),

('750e8400-e29b-41d4-a716-446655440002',
 'Meeting Summarizer',
 'summarization',
 'Summarizes meeting notes and extracts key action items',
 'gpt-4o-mini',
 0.3,
 true,
 '{"extract_action_items": true, "identify_stakeholders": true, "detect_objections": true}'),

('750e8400-e29b-41d4-a716-446655440003',
 'Lead Scoring Engine',
 'scoring',
 'Analyzes lead data and assigns quality scores',
 'gpt-4o-mini',
 0.3,
 true,
 '{"scoring_factors": ["company_size", "budget_indicators", "engagement_level", "pain_points"]}');

-- ============================================================================
-- DEMO MARKER
-- ============================================================================

-- This helps identify demo vs production data
INSERT INTO activities (lead_id, type, subject, content, direction) VALUES
('650e8400-e29b-41d4-a716-446655440020', 'note', 'Demo Data Initialized',
 'This database includes comprehensive demo data for showcasing the Agentic CRM capabilities.',
 'outbound');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Demo data loaded successfully!';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   - 5 demo companies added';
  RAISE NOTICE '   - 7 demo leads added (various stages)';
  RAISE NOTICE '   - 10+ activities added';
  RAISE NOTICE '   - 3 additional agents defined';
  RAISE NOTICE '';
  RAISE NOTICE '🎬 Demo scenarios ready!';
  RAISE NOTICE '   Access at: http://localhost:3000';
END $$;

