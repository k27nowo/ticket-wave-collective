
import { Event } from '@/types/event';

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
