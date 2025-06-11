
-- Create a table for team invitations
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_owner_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, expired
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  token TEXT NOT NULL DEFAULT gen_random_uuid()::text
);

-- Create a table for team members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_owner_id UUID REFERENCES auth.users NOT NULL,
  member_id UUID REFERENCES auth.users NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'active', -- active, inactive
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_owner_id, member_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_invitations
CREATE POLICY "Team owners can view their invitations" 
  ON public.team_invitations 
  FOR SELECT 
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Team owners can create invitations" 
  ON public.team_invitations 
  FOR INSERT 
  WITH CHECK (auth.uid() = team_owner_id);

CREATE POLICY "Team owners can update their invitations" 
  ON public.team_invitations 
  FOR UPDATE 
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Team owners can delete their invitations" 
  ON public.team_invitations 
  FOR DELETE 
  USING (auth.uid() = team_owner_id);

-- Create policies for team_members
CREATE POLICY "Team owners can view their team members" 
  ON public.team_members 
  FOR SELECT 
  USING (auth.uid() = team_owner_id OR auth.uid() = member_id);

CREATE POLICY "Team owners can add team members" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (auth.uid() = team_owner_id);

CREATE POLICY "Team owners can update team members" 
  ON public.team_members 
  FOR UPDATE 
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Team owners can remove team members" 
  ON public.team_members 
  FOR DELETE 
  USING (auth.uid() = team_owner_id);

-- Create function to handle team invitation acceptance
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record public.team_invitations;
  result json;
BEGIN
  -- Find the invitation
  SELECT * INTO invitation_record
  FROM public.team_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Check if user is already a team member
  IF EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_owner_id = invitation_record.team_owner_id 
    AND member_id = auth.uid()
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is already a team member');
  END IF;
  
  -- Add user to team
  INSERT INTO public.team_members (
    team_owner_id, 
    member_id, 
    email, 
    role
  ) VALUES (
    invitation_record.team_owner_id,
    auth.uid(),
    invitation_record.email,
    invitation_record.role
  );
  
  -- Update invitation status
  UPDATE public.team_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;
  
  RETURN json_build_object('success', true, 'role', invitation_record.role);
END;
$$;
