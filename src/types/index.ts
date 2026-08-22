export type UserRole = 'citizen' | 'department' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProblemCategory {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string;
  color: string;
  default_priority: number;
  expected_resolution_hours: number;
  is_active: boolean;
  created_at: string;
}

export type ReportStatus =
  | 'submitted'
  | 'analyzing'
  | 'analyzed'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'rejected'
  | 'closed';

export interface Report {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  location_address: string | null;
  status: ReportStatus;
  priority: number;
  department_id: string | null;
  assigned_to: string | null;
  image_urls: string[];
  is_duplicate: boolean;
  master_report_id: string | null;
  submitted_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  category?: ProblemCategory;
  department?: Department;
  ai_analysis?: AiAnalysis;
  profile?: Profile;
}

export interface PossibleCause {
  cause: string;
  confidence: number;
  evidence: string[];
  severity: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'short-term' | 'long-term';
}

export interface RecommendedAction {
  action: string;
  confidence: number;
  priority: number;
  estimated_duration_hours: number;
  expected_impact: string;
  department: string;
  steps: string[];
}

export interface RelationshipNode {
  id: string;
  label: string;
}
export interface RelationshipEdge {
  from: string;
  to: string;
  label: string;
  weight: number;
}

export interface AiAnalysis {
  id: string;
  report_id: string;
  detected_problem: string | null;
  problem_confidence: number | null;
  visible_conditions: string[];
  extracted_context: Record<string, unknown>;
  text_confidence: number | null;
  final_problem_type: string | null;
  final_confidence: number | null;
  authenticity_score: number | null;
  is_authentic: boolean | null;
  verification_details: Record<string, unknown>;
  possible_causes: PossibleCause[];
  recommended_action: string | null;
  action_confidence: number | null;
  alternative_actions: RecommendedAction[];
  related_incident_count: number;
  relationship_graph: { nodes: RelationshipNode[]; edges: RelationshipEdge[] };
  processing_time_ms: number | null;
  is_manual_override: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionTaken {
  id: string;
  report_id: string;
  action_type: string;
  description: string | null;
  performed_by: string;
  after_image_urls: string[];
  cost: number | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  report_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}
