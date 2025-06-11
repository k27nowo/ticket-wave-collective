
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
      console.log('Fetching events...');
      
      // Since we don't have the actual tables set up yet, we'll use mock data
      // In a real implementation, this would be:
      // const { data: eventsData, error } = await supabase
      //   .from('events')
      //   .select(`
      //     *,
      //     ticket_types(*)
      //   `)
      //   .order('created_at', { ascending: false });

      console.log('Using mock data for events');
      setEvents([
        {
          id: '1',
          title: 'Summer Music Festival 2024',
          description: 'Join us for an amazing summer festival with top artists.',
          date: '2024-07-15T18:00:00Z',
          location: 'Central Park, New York',
          image_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop',
          user_id: user?.id || '',
          created_at: '2024-06-01T10:00:00Z',
          updated_at: '2024-06-01T10:00:00Z',
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
      ]);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      setEvents([]);
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
      console.log('Creating event with data:', eventData);

      // Combine date and time
      const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);

      // For now, we'll create a mock event since the database tables don't exist yet
      // In a real implementation, this would be:
      // const { data: newEvent, error: eventError } = await supabase
      //   .from('events')
      //   .insert({
      //     title: eventData.title.trim(),
      //     description: eventData.description?.trim() || '',
      //     date: eventDateTime.toISOString(),
      //     location: eventData.location.trim(),
      //     image_url: eventData.image_url || '',
      //     user_id: user.id
      //   })
      //   .select()
      //   .single();

      // Create mock event
      const newEvent = {
        id: crypto.randomUUID(),
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        date: eventDateTime.toISOString(),
        location: eventData.location.trim(),
        image_url: eventData.image_url || '',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ticket_types: eventData.ticketTypes.map(ticket => ({
          id: crypto.randomUUID(),
          event_id: '', // Will be set after event creation
          name: ticket.name.trim(),
          price: ticket.price,
          quantity: ticket.quantity,
          sold: 0,
          description: ticket.description?.trim() || '',
          is_password_protected: ticket.isPasswordProtected || false,
          password_hash: ticket.password || '', // In real implementation, this would be hashed
          created_at: new Date().toISOString()
        }))
      };

      console.log('Mock event created:', newEvent);
      toast.success('Event created successfully! (Note: This is mock data until database is set up)');
      
      // Add to local state
      setEvents(prevEvents => [newEvent, ...prevEvents]);
      
      return newEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event: ' + error.message);
      throw error;
    }
  };

  const verifyTicketPassword = async (ticketTypeId: string, password: string) => {
    try {
      // For now, return true since we're using mock data
      // In a real implementation, this would verify against the database
      console.log('Verifying ticket password for ticket:', ticketTypeId);
      return true;
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
