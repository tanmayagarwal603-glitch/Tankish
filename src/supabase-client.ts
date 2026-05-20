// src/supabase-client.ts
// ─── paste your Supabase URL and anon key here ───────────────
// OR set them as Vercel environment variables (recommended)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── TYPE EXPORTS ─────────────────────────────────────────────
export type UserRole = 'admin' | 'manager' | 'staff';

export interface Profile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  stage: string;
  urgency: string;
  plot_size: string;
  budget_lakh: number;
  revenue_lakh: number;
  completion_pct: number;
  rera_status: string;
  lda_status: string;
  key_risk: string;
  next_action: string;
  notes: string;
  created_at: string;
  updates?: ProjectUpdate[];
  documents?: ProjectDocument[];
  payments?: ProjectPayment[];
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  user_id: string;
  work_done: string;
  materials: string;
  issues: string;
  completion_pct: number;
  date: string;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  name: string;
  file_url: string;
  file_path: string;
  category: string;
  size: number;
  date: string;
}

export interface ProjectPayment {
  id: string;
  project_id: string;
  paid_to: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface StaffMember {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  daily_wage: number;
  project_id?: string;
  advance: number;
  status: string;
  project?: Project;
}

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  status: 'present' | 'half' | 'absent' | 'leave';
}

export interface Advance {
  id: string;
  staff_id: string;
  amount: number;
  reason: string;
  date: string;
  staff?: StaffMember;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string;
  project_id: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  created_at: string;
  staff?: StaffMember;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  tenant: string;
  tenant_phone: string;
  monthly_rent: number;
  water_charges: number;
  electricity_type: string;
  due_day: number;
  assigned_staff: string;
}

export interface RentRecord {
  id: string;
  property_id: string;
  amount: number;
  date: string;
  month: string;
  payment_mode: string;
  notes: string;
}
