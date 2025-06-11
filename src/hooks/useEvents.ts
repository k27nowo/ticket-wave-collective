
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description?: string;
  is_password_protected: boolean;
  password_hash?: string;
  created_at: string;
}

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*)
        `)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    image_url?: string;
    ticketTypes: {
      name: string;
      price: number;
      quantity: number;
      description?: string;
      isPasswordProtected?: boolean;
      password?: string;
    }[];
  }) => {
    if (!user) {
      toast.error('You must be logged in to create events');
      return;
    }

    try {
      // Log audit event
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE_EVENT_ATTEMPT',
        p_resource_type: 'event',
        p_details: { title: eventData.title }
      });

      // Combine date and time
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title: eventData.title.trim(),
          description: eventData.description?.trim(),
          date: eventDateTime.toISOString(),
          location: eventData.location.trim(),
          image_url: eventData.image_url,
          user_id: user.id
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create ticket types
      for (const ticketType of eventData.ticketTypes) {
        const ticketData: any = {
          event_id: event.id,
          name: ticketType.name.trim(),
          price: ticketType.price,
          quantity: ticketType.quantity,
          description: ticketType.description?.trim(),
          is_password_protected: ticketType.isPasswordProtected || false
        };

        // Hash password if provided
        if (ticketType.isPasswordProtected && ticketType.password) {
          const { data: hashedPassword } = await supabase.rpc('hash_password', {
            password: ticketType.password
          });
          ticketData.password_hash = hashedPassword;
        }

        const { error: ticketError } = await supabase
          .from('ticket_types')
          .insert(ticketData);

        if (ticketError) throw ticketError;
      }

      // Log successful creation
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE_EVENT_SUCCESS',
        p_resource_type: 'event',
        p_resource_id: event.id,
        p_details: { title: event.title }
      });

      toast.success('Event created successfully!');
      await fetchEvents();
      return event;
    } catch (error: any) {
      console.error('Error creating event:', error);
      
      // Log failed creation
      await supabase.rpc('log_audit_event', {
        p_action: 'CREATE_EVENT_FAILED',
        p_resource_type: 'event',
        p_details: { error: error.message, title: eventData.title }
      });

      toast.error('Failed to create event: ' + error.message);
      throw error;
    }
  };

  const verifyTicketPassword = async (ticketTypeId: string, password: string) => {
    try {
      const { data: ticketType, error } = await supabase
        .from('ticket_types')
        .select('password_hash')
        .eq('id', ticketTypeId)
        .single();

      if (error) throw error;

      if (!ticketType.password_hash) return true;

      const { data: isValid } = await supabase.rpc('verify_password', {
        password,
        hash: ticketType.password_hash
      });

      return isValid;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    verifyTicketPassword,
    refetchEvents: fetchEvents
  };
};
