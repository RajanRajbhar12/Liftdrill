-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Enable Row Level Security
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create policies for wallets
CREATE POLICY "Users can view their own wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert wallets for new users"
    ON wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to increment wallet balance
CREATE OR REPLACE FUNCTION increment_wallet_balance(
    p_user_id UUID,
    p_amount DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    v_new_balance DECIMAL;
BEGIN
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE user_id = p_user_id
    RETURNING balance INTO v_new_balance;
    
    RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 