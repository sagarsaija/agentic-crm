export type LeadStatus =
  | "new"
  | "researching"
  | "qualified"
  | "contacted"
  | "engaged"
  | "nurturing"
  | "won"
  | "lost";

export type LeadSource =
  | "manual"
  | "agent_discovery"
  | "inbound"
  | "referral"
  | "import";

export type ActivityType =
  | "email_sent"
  | "email_received"
  | "call"
  | "meeting"
  | "note"
  | "status_change"
  | "agent_action";

export type WorkflowType =
  | "lead_generation"
  | "outbound_sequence"
  | "re_engagement"
  | "custom";

export type WorkflowTrigger = "manual" | "scheduled" | "event";

export type WorkflowRunStatus = "running" | "completed" | "failed" | "paused";

export type AgentRunStatus = "running" | "completed" | "failed";

export interface Lead {
  id: string;
  status: LeadStatus;
  score: number;

  // Contact Info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  title?: string;

  // Company
  company_id?: string;
  company_name?: string;

  // Source
  source: LeadSource;
  source_details?: string;

  // Enrichment
  linkedin_url?: string;
  twitter_url?: string;
  location?: string;
  timezone?: string;

  // Intelligence
  research_summary?: string;
  pain_points?: string[];
  buying_signals?: string[];
  personal_notes?: string;

  // Assignment
  owner_id?: string;

  // Workflow
  current_workflow_id?: string;
  workflow_stage?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  last_contacted_at?: string;
  next_follow_up_at?: string;

  // Custom Fields
  custom_fields?: Record<string, any>;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  revenue?: string;
  funding_stage?: string;
  funding_amount?: number;
  location?: string;
  description?: string;
  tech_stack?: string[];
  competitors?: string[];
  recent_news?: Array<{ title: string; date: string; url: string }>;
  social_profiles?: { linkedin?: string; twitter?: string };
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  subject?: string;
  content?: string;
  metadata?: Record<string, any>;
  agent_id?: string;
  user_id?: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  type: WorkflowType;
  graph_definition: any; // LangGraph JSON
  is_active: boolean;
  trigger: WorkflowTrigger;
  trigger_config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  lead_id?: string;
  status: WorkflowRunStatus;
  current_node?: string;
  state?: Record<string, any>;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description?: string;
  config?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  workflow_run_id: string;
  lead_id?: string;
  status: AgentRunStatus;
  input?: any;
  output?: any;
  logs?: any[];
  started_at: string;
  completed_at?: string;
  error?: string;
  cost: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  template_id?: string;
  status: "draft" | "scheduled" | "running" | "paused" | "completed";
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  name: string;
  provider: string;
  config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
