import { Event, CreateEventData } from '@/types/event';

// Re-export all functions from the specialized services
export { getMockEvents } from './mockEventService';
export { 
  fetchEventsFromDatabase, 
  createEventInDatabase, 
  updateEventInDatabase 
} from './eventDatabaseService';
export { verifyTicketPasswordInDatabase } from './ticketService';
export { createOrderInDatabase } from './orderService';

// Keep the main service as a clean interface that re-exports everything
// This ensures existing imports continue to work without breaking changes
