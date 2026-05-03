-- Migration for Hard Lock System
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Create settings table for global config
CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize default trial duration
INSERT INTO admin_settings (key, value)
VALUES ('trial_duration_days', '7'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update the signup trigger to use dynamic duration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    trial_days INT;
BEGIN
    SELECT (value->>0)::INT INTO trial_days FROM admin_settings WHERE key = 'trial_duration_days';
    IF trial_days IS NULL THEN trial_days := 7; END IF;

    INSERT INTO public.user_profiles (
        id, 
        name, 
        email, 
        subscription_plan, 
        subscription_status, 
        trial_start_date, 
        trial_end_date,
        is_locked
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        'trial',
        'trial',
        NOW(),
        NOW() + (trial_days || ' days')::INTERVAL,
        false
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
