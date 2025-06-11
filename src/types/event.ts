
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

export interface CreateEventData {
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
}
