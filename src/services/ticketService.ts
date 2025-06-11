
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

// Helper function to get current sold count
export const getCurrentSoldCount = async (ticketTypeId: string): Promise<number> => {
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
