
-- Add overall_ticket_limit column to events table
ALTER TABLE public.events 
ADD COLUMN overall_ticket_limit INTEGER;

-- Add a comment to explain the column
COMMENT ON COLUMN public.events.overall_ticket_limit IS 'Overall ticket limit across all ticket types for this event';
