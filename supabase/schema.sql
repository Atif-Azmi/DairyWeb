-- 1 -- Drop existing tables if they exist
DROP TABLE IF EXISTS daily_bill_shares CASCADE;
DROP TABLE IF EXISTS daily_entries CASCADE;
DROP TABLE IF EXISTS daily_transactions CASCADE;
DROP TABLE IF EXISTS daily_profile CASCADE;
DROP TABLE IF EXISTS daily_products CASCADE;
DROP TABLE IF EXISTS daily_customers CASCADE;
DROP TABLE IF EXISTS daily_retail_sales CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- 2 -- Core SaaS Tables
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone VARCHAR,
    plan VARCHAR NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plan1', 'plan2')),
    trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_id VARCHAR,
    subscription_status VARCHAR DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR UNIQUE,
    plan_id VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR UNIQUE,
    razorpay_order_id VARCHAR,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR DEFAULT 'INR',
    status VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3 -- Business Tables (Multi-tenant)
CREATE TABLE daily_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name VARCHAR NOT NULL,
    phone VARCHAR,
    address TEXT,
    default_milk_qty NUMERIC(10,2) DEFAULT 0,
    custom_milk_rate NUMERIC(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_products (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name VARCHAR(64) NOT NULL,
    default_rate NUMERIC(10,2) NOT NULL,
    unit VARCHAR NOT NULL CHECK (unit IN ('liter', 'kg')),
    CONSTRAINT products_name_user_unique UNIQUE (user_id, name)
);

CREATE TABLE daily_profile (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    dairy_name VARCHAR(200) NOT NULL DEFAULT 'My Dairy',
    tagline VARCHAR(300),
    address TEXT,
    phone VARCHAR(50),
    gst VARCHAR(50),
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    customer_id UUID NOT NULL REFERENCES daily_customers(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES daily_products(id),
    date DATE NOT NULL,
    shift VARCHAR NOT NULL CHECK (shift IN ('morning', 'evening')),
    quantity NUMERIC(10,3) NOT NULL CHECK (quantity >= 0),
    price_per_unit NUMERIC(10,2) NOT NULL,
    total_amount NUMERIC(12,2) GENERATED ALWAYS AS (quantity * price_per_unit) STORED
);

CREATE INDEX idx_entries_user_customer_date ON daily_entries(user_id, customer_id, date);

CREATE TABLE daily_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    customer_id UUID NOT NULL REFERENCES daily_customers(id) ON DELETE CASCADE,
    type VARCHAR NOT NULL CHECK (type IN ('advance', 'payment', 'adjustment')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    payment_mode VARCHAR NOT NULL CHECK (payment_mode IN ('cash', 'online', 'upi')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT
);

CREATE INDEX idx_transactions_user_customer_date ON daily_transactions(user_id, customer_id, date);

CREATE TABLE daily_bill_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    customer_id UUID NOT NULL REFERENCES daily_customers(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE daily_retail_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    product_id INT NOT NULL REFERENCES daily_products(id),
    quantity NUMERIC(10,3) NOT NULL CHECK (quantity >= 0),
    total_amount NUMERIC(12,2) NOT NULL,
    payment_mode VARCHAR NOT NULL CHECK (payment_mode IN ('cash', 'online', 'upi')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4 -- RLS Policies (Proper Multi-tenancy)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bill_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_retail_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own profile" ON user_profiles FOR ALL TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can only see their own subscriptions" ON user_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own payments" ON payments FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own customers" ON daily_customers FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own products" ON daily_products FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own dairy profile" ON daily_profile FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own entries" ON daily_entries FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own transactions" ON daily_transactions FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own bill shares" ON daily_bill_shares FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own retail sales" ON daily_retail_sales FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Users can only upload to their own folder in bills" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'bills' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can only read their own folder in bills" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'bills' AND (storage.foldername(name))[1] = auth.uid()::text);


-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS 
BEGIN
    INSERT INTO public.user_profiles (id, name, email, plan, trial_start_date)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email,
        'free',
        NOW()
    );
    RETURN new;
END;
 LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
