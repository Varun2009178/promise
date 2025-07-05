-- Create accountability_invitations table
CREATE TABLE IF NOT EXISTS accountability_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_email TEXT NOT NULL,
    promise_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accountability_invitations_user_id ON accountability_invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_accountability_invitations_partner_email ON accountability_invitations(partner_email);
CREATE INDEX IF NOT EXISTS idx_accountability_invitations_status ON accountability_invitations(status);

-- Create RLS policies
ALTER TABLE accountability_invitations ENABLE ROW LEVEL SECURITY;

-- Users can view their own invitations
CREATE POLICY "Users can view their own invitations" ON accountability_invitations
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Users can create invitations
CREATE POLICY "Users can create invitations" ON accountability_invitations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Users can update their own invitations
CREATE POLICY "Users can update their own invitations" ON accountability_invitations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own invitations
CREATE POLICY "Users can delete their own invitations" ON accountability_invitations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_accountability_invitations_updated_at 
    BEFORE UPDATE ON accountability_invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE accountability_invitations IS 'Stores accountability partner invitations';
COMMENT ON COLUMN accountability_invitations.user_id IS 'The user who sent the invitation';
COMMENT ON COLUMN accountability_invitations.partner_email IS 'Email of the invited accountability partner';
COMMENT ON COLUMN accountability_invitations.promise_text IS 'The promise text for context';
COMMENT ON COLUMN accountability_invitations.status IS 'Status of the invitation: pending, accepted, or declined'; 