
import { Event, CreateEventData } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
