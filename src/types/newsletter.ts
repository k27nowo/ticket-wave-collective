
export interface NewsletterTemplate {
  id: number;
  name: string;
  title: string;
  subject: string;
  message: string;
  rules: string[];
}

export interface Customer {
  id: number;
  email: string;
  name: string;
  lastPurchase: string;
  eventsAttended: number;
  totalTickets: number;
}

export interface Event {
  id: number;
  title: string;
  date: string;
}
