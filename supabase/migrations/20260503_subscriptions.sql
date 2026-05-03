-- Migration to add subscription fields to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR DEFAULT 'trial' CHECK (subscription_plan IN ('trial', 'plan1', 'plan2', 'none')),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Update existing trial users
UPDATE user_profiles 
SET subscription_plan = 'trial', 
    subscription_status = 'trial', 
    trial_start_date = COALESCE(trial_start_date, NOW()),
    trial_end_date = COALESCE(trial_start_date, NOW()) + INTERVAL '7 days'
WHERE subscription_plan IS NULL OR subscription_plan = 'trial';

-- Update the signup trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS 
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        name, 
        email, 
        subscription_plan, 
        subscription_status, 
        trial_start_date, 
        trial_end_date
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        'trial',
        'trial',
        NOW(),
        NOW() + INTERVAL '7 days'
    );
    RETURN new;
END;
LANGUAGE plpgsql SECURITY DEFINER;
