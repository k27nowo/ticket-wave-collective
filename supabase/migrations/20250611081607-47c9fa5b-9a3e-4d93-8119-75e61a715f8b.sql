
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ticket_types table
CREATE TABLE public.ticket_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  sold INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_password_protected BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create orders table for tracking purchases
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create order_items table for individual ticket purchases
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  price_per_ticket DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view all events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = user_id);

-- Ticket types policies
CREATE POLICY "Users can view all ticket types" ON public.ticket_types
  FOR SELECT USING (true);

CREATE POLICY "Event owners can manage ticket types" ON public.ticket_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = ticket_types.event_id 
      AND events.user_id = auth.uid()
    )
  );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Order items policies
CREATE POLICY "Users can view order items for their orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_ticket_types_event_id ON public.ticket_types(event_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_event_id ON public.orders(event_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_ticket_type_id ON public.order_items(ticket_type_id);
