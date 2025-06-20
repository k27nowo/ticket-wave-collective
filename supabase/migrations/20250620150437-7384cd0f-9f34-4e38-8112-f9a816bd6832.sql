
-- Create a table to store individual tickets with QR codes
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view tickets for their orders
CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = tickets.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- Policy to allow anyone to create tickets (for order processing)
CREATE POLICY "Anyone can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- Policy to allow ticket validation (for QR code scanning)
CREATE POLICY "Anyone can update ticket usage" ON public.tickets
  FOR UPDATE WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code);
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);

-- Function to generate unique ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ticket_num TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    -- Generate a ticket number with format: TKT-YYYYMMDD-XXXXXX
    ticket_num := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if this ticket number already exists
    IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = ticket_num) THEN
      RETURN ticket_num;
    END IF;
    
    -- Safety counter to prevent infinite loop
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Unable to generate unique ticket number after 100 attempts';
    END IF;
  END LOOP;
END;
$$;
