
-- Create a table for payment settings
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL, -- 'paypal' or 'stripe'
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}', -- Store provider-specific settings
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_settings
CREATE POLICY "Users can view their own payment settings" 
  ON public.payment_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment settings" 
  ON public.payment_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment settings" 
  ON public.payment_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment settings" 
  ON public.payment_settings 
  FOR DELETE 
  USING (auth.uid() = user_id);
