import { Event, CreateEventData } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const getMockEvents = (): Event[] => {
  return [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      description: 'Join us for an amazing summer festival with top artists.',
      date: '2024-07-15T18:00:00Z',
      location: 'Central Park, New York',
      image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop',
      user_id: '',
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-01T10:00:00Z',
      overall_ticket_limit: 300,
      ticket_types: [
        {
          id: '1',
          event_id: '1',
          name: 'Early Bird',
          price: 50,
          quantity: 100,
          sold: 25,
          description: 'Limited time offer',
          is_password_protected: false,
          created_at: '2024-06-01T10:00:00Z'
        },
        {
          id: '2',
          event_id: '1',
          name: 'VIP',
          price: 150,
          quantity: 50,
          sold: 10,
          description: 'Premium experience',
          is_password_protected: true,
          created_at: '2024-06-01T10:00:00Z'
        }
      ]
    }
  ];
};

export const fetchEventsFromDatabase = async (userId?: string): Promise<Event[]> => {
  try {
    console.log('Fetching events from database...');
    
    let query = supabase
      .from('events')
      .select(`
        *,
        ticket_types(*)
      `)
      .order('created_at', { ascending: false });

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: eventsData, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      throw error;
    }

    return eventsData || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    toast.error('Failed to load events');
    return [];
  }
};

export const createEventInDatabase = async (eventData: CreateEventData, userId: string): Promise<Event> => {
  try {
    console.log('Creating event in database:', eventData);

    // Create the event
    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .insert({
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        date: `${eventData.date}T${eventData.time}`,
        location: eventData.location.trim(),
        image_url: eventData.image_url || '',
        overall_ticket_limit: eventData.overall_ticket_limit,
        user_id: userId
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Create ticket types
    const ticketTypesData = eventData.ticketTypes.map(ticket => ({
      event_id: eventResult.id,
      name: ticket.name.trim(),
      price: ticket.price,
      quantity: ticket.quantity,
      description: ticket.description?.trim() || '',
      is_password_protected: ticket.isPasswordProtected || false,
      password_hash: ticket.password || ''
    }));

    const { data: ticketTypes, error: ticketError } = await supabase
      .from('ticket_types')
      .insert(ticketTypesData)
      .select();

    if (ticketError) throw ticketError;

    // Return the complete event with ticket types
    return {
      ...eventResult,
      ticket_types: ticketTypes
    };
  } catch (error: any) {
    console.error('Error creating event:', error);
    toast.error('Failed to create event: ' + error.message);
    throw error;
  }
};

export const updateEventInDatabase = async (eventId: string, eventData: Partial<CreateEventData>): Promise<Event> => {
  try {
    console.log('Updating event in database:', eventId, eventData);

    const updateData: any = {};
    if (eventData.title) updateData.title = eventData.title.trim();
    if (eventData.description !== undefined) updateData.description = eventData.description?.trim() || '';
    if (eventData.date && eventData.time) updateData.date = `${eventData.date}T${eventData.time}`;
    if (eventData.location) updateData.location = eventData.location.trim();
    if (eventData.image_url !== undefined) updateData.image_url = eventData.image_url;
    if (eventData.overall_ticket_limit !== undefined) updateData.overall_ticket_limit = eventData.overall_ticket_limit;
    updateData.updated_at = new Date().toISOString();

    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (eventError) throw eventError;

    // Handle ticket types if provided
    if (eventData.ticketTypes) {
      // Delete existing ticket types
      await supabase
        .from('ticket_types')
        .delete()
        .eq('event_id', eventId);

      // Create new ticket types
      const ticketTypesData = eventData.ticketTypes.map(ticket => ({
        event_id: eventId,
        name: ticket.name.trim(),
        price: ticket.price,
        quantity: ticket.quantity,
        description: ticket.description?.trim() || '',
        is_password_protected: ticket.isPasswordProtected || false,
        password_hash: ticket.password || ''
      }));

      const { data: ticketTypes, error: ticketError } = await supabase
        .from('ticket_types')
        .insert(ticketTypesData)
        .select();

      if (ticketError) throw ticketError;

      return {
        ...eventResult,
        ticket_types: ticketTypes
      };
    }

    // Fetch ticket types separately if not updating them
    const { data: ticketTypes } = await supabase
      .from('ticket_types')
      .select('*')
      .eq('event_id', eventId);

    return {
      ...eventResult,
      ticket_types: ticketTypes || []
    };
  } catch (error: any) {
    console.error('Error updating event:', error);
    toast.error('Failed to update event: ' + error.message);
    throw error;
  }
};

export const verifyTicketPasswordInDatabase = async (ticketTypeId: string, password: string): Promise<boolean> => {
  try {
    console.log('Verifying ticket password for ticket:', ticketTypeId);
    
    const { data: ticketType, error } = await supabase
      .from('ticket_types')
      .select('password_hash')
      .eq('id', ticketTypeId)
      .single();

    if (error) {
      console.error('Error fetching ticket type:', error);
      return false;
    }

    // Simple password comparison (in production, you'd use proper password hashing)
    return ticketType.password_hash === password;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const createOrderInDatabase = async (orderData: {
  eventId: string;
  userId?: string;
  totalAmount: number;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
    pricePerTicket: number;
  }>;
}): Promise<string> => {
  try {
    console.log('Creating order in database:', orderData);

    // Check overall ticket limit before creating order
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('overall_ticket_limit')
      .eq('id', orderData.eventId)
      .single();

    if (eventError) throw eventError;

    if (event.overall_ticket_limit) {
      // Calculate total tickets already sold for this event
      const { data: ticketTypes, error: ticketTypesError } = await supabase
        .from('ticket_types')
        .select('sold')
        .eq('event_id', orderData.eventId);

      if (ticketTypesError) throw ticketTypesError;

      const totalSold = ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
      const totalOrderQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);

      if (totalSold + totalOrderQuantity > event.overall_ticket_limit) {
        throw new Error(`Order exceeds overall ticket limit. Only ${event.overall_ticket_limit - totalSold} tickets remaining.`);
      }
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        event_id: orderData.eventId,
        user_id: orderData.userId || null,
        total_amount: orderData.totalAmount,
        status: 'completed'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = orderData.items.map(item => ({
      order_id: order.id,
      ticket_type_id: item.ticketTypeId,
      quantity: item.quantity,
      price_per_ticket: item.pricePerTicket
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Update sold count for each ticket type using direct SQL update
    for (const item of orderData.items) {
      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({ 
          sold: await getCurrentSoldCount(item.ticketTypeId) + item.quantity 
        })
        .eq('id', item.ticketTypeId);

      if (updateError) {
        console.error('Error updating sold count:', updateError);
        throw updateError;
      }
    }

    return order.id;
  } catch (error: any) {
    console.error('Error creating order:', error);
    toast.error('Failed to process order: ' + error.message);
    throw error;
  }
};

// Helper function to get current sold count
const getCurrentSoldCount = async (ticketTypeId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('sold')
    .eq('id', ticketTypeId)
    .single();
  
  if (error) {
    console.error('Error fetching current sold count:', error);
    return 0;
  }
  
  return data.sold || 0;
};
