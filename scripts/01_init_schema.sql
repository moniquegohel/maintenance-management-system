-- Create tables for GearGuard Maintenance Management System

-- 1. Users table (using Supabase Auth, we extend with profile info)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  department TEXT,
  role TEXT DEFAULT 'technician', -- 'admin', 'manager', 'technician'
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Equipment Categories
CREATE TABLE IF NOT EXISTS equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Maintenance Teams
CREATE TABLE IF NOT EXISTS maintenance_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  department TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Team Members (Junction table)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'lead', 'member'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 5. Equipment (Assets)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  category_id UUID NOT NULL REFERENCES equipment_categories(id),
  department TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  maintenance_team_id UUID NOT NULL REFERENCES maintenance_teams(id),
  default_technician_id UUID REFERENCES profiles(id),
  purchase_date DATE,
  warranty_expiry DATE,
  location TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'scrapped'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  equipment_id UUID NOT NULL REFERENCES equipment(id),
  category_id UUID REFERENCES equipment_categories(id),
  team_id UUID NOT NULL REFERENCES maintenance_teams(id),
  type TEXT NOT NULL, -- 'corrective', 'preventive'
  stage TEXT DEFAULT 'new', -- 'new', 'in_progress', 'repaired', 'scrap'
  assigned_to UUID REFERENCES profiles(id),
  description TEXT,
  scheduled_date DATE,
  start_date TIMESTAMP,
  completed_date TIMESTAMP,
  duration_hours NUMERIC(10, 2),
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  is_overdue BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Maintenance Request History (Audit trail)
CREATE TABLE IF NOT EXISTS maintenance_request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  old_stage TEXT,
  new_stage TEXT,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(team_id);
CREATE INDEX idx_requests_stage ON maintenance_requests(stage);
CREATE INDEX idx_requests_assigned_to ON maintenance_requests(assigned_to);
CREATE INDEX idx_requests_scheduled_date ON maintenance_requests(scheduled_date);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_request_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles: Users can read all profiles, update their own
CREATE POLICY "Profiles are viewable by all authenticated users" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Equipment Categories: Viewable by all
CREATE POLICY "Equipment categories viewable by all" 
  ON equipment_categories FOR SELECT 
  TO authenticated 
  USING (true);

-- Teams: Viewable by all
CREATE POLICY "Teams viewable by all authenticated users" 
  ON maintenance_teams FOR SELECT 
  TO authenticated 
  USING (true);

-- Team Members: Viewable by all
CREATE POLICY "Team members viewable by all" 
  ON team_members FOR SELECT 
  TO authenticated 
  USING (true);

-- Equipment: Viewable by all, editable by admins/managers
CREATE POLICY "Equipment viewable by all authenticated users" 
  ON equipment FOR SELECT 
  TO authenticated 
  USING (true);

-- Maintenance Requests: Viewable by team members and admins
CREATE POLICY "Requests viewable by assigned or team members" 
  ON maintenance_requests FOR SELECT 
  TO authenticated 
  USING (
    assigned_to = auth.uid() 
    OR team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Users can create maintenance requests" 
  ON maintenance_requests FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update assigned requests" 
  ON maintenance_requests FOR UPDATE 
  TO authenticated 
  USING (
    assigned_to = auth.uid() 
    OR created_by = auth.uid()
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Request History: Viewable by authorized users
CREATE POLICY "Request history viewable by authorized users" 
  ON maintenance_request_history FOR SELECT 
  TO authenticated 
  USING (
    request_id IN (
      SELECT id FROM maintenance_requests WHERE 
      assigned_to = auth.uid() 
      OR created_by = auth.uid()
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );
