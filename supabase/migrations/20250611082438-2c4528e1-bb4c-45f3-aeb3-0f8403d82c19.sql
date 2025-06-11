
-- Create a table to store newsletter campaigns
CREATE TABLE public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  event_id UUID REFERENCES public.events,
  sent_at TIMESTAMP WITH TIME ZONE,
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to track email recipients
CREATE TABLE public.newsletter_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.newsletter_campaigns NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_recipients ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.newsletter_campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.newsletter_campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.newsletter_campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.newsletter_campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for newsletter_recipients
CREATE POLICY "Users can view recipients of their campaigns" 
  ON public.newsletter_recipients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.newsletter_campaigns 
      WHERE newsletter_campaigns.id = newsletter_recipients.campaign_id 
      AND newsletter_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recipients for their campaigns" 
  ON public.newsletter_recipients 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.newsletter_campaigns 
      WHERE newsletter_campaigns.id = newsletter_recipients.campaign_id 
      AND newsletter_campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recipients of their campaigns" 
  ON public.newsletter_recipients 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.newsletter_campaigns 
      WHERE newsletter_campaigns.id = newsletter_recipients.campaign_id 
      AND newsletter_campaigns.user_id = auth.uid()
    )
  );
