
-- Create function to safely increment ticket sold count
CREATE OR REPLACE FUNCTION increment_ticket_sold(ticket_type_id UUID, quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.ticket_types
  SET sold = sold + quantity
  WHERE id = ticket_type_id;
END;
$$;
