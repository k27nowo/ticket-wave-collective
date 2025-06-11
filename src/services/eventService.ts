
import { Event, CreateEventData } from '@/types/event';
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
    const mockEvents = getMockEvents();
    
    // Set user_id for mock events if user is provided
    if (userId) {
      mockEvents.forEach(event => {
        event.user_id = userId;
      });
    }
    
    return mockEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    toast.error('Failed to load events');
    return [];
  }
};

export const verifyTicketPasswordInDatabase = async (ticketTypeId: string, password: string): Promise<boolean> => {
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
