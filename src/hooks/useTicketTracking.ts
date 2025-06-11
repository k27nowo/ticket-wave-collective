
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TicketPurchase {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  paymentMethod: string;
  orderId: string;
}

export interface AttendanceStats {
  userName: string;
  userEmail: string;
  totalTickets: number;
  totalSpent: number;
  lastPurchase: string;
  orderCount: number;
}

export const useTicketTracking = () => {
  const [purchases, setPurchases] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTicketPurchases = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching ticket purchases for user:', user.id);

      // Fetch orders with order items and related data
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          payment_method,
          created_at,
          user_id,
          events!inner(
            id,
            title,
            user_id
          ),
          order_items(
            quantity,
            price_per_ticket,
            ticket_types(
              name
            )
          )
        `)
        .eq('events.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Orders data:', ordersData);

      // Transform the data into the format expected by the UI
      const transformedPurchases: TicketPurchase[] = [];

      for (const order of ordersData || []) {
        // Get user profile for user information
        let userName = 'Guest User';
        let userEmail = 'guest@example.com';

        if (order.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', order.user_id)
            .single();

          if (profile) {
            userName = profile.full_name || 'Anonymous User';
            userEmail = profile.email || 'unknown@example.com';
          }
        }

        // Create a purchase record for each order item
        for (const item of order.order_items || []) {
          transformedPurchases.push({
            id: `${order.id}-${item.ticket_types?.name}`,
            eventId: order.events.id,
            eventTitle: order.events.title,
            userName,
            userEmail,
            ticketType: item.ticket_types?.name || 'Unknown',
            quantity: item.quantity,
            totalPrice: item.quantity * item.price_per_ticket,
            purchaseDate: order.created_at,
            paymentMethod: order.payment_method || 'Unknown',
            orderId: order.id
          });
        }
      }

      setPurchases(transformedPurchases);
    } catch (error: any) {
      console.error('Error fetching ticket purchases:', error);
      toast.error('Failed to load ticket data');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = (): AttendanceStats[] => {
    const statsMap = new Map<string, AttendanceStats>();

    purchases.forEach(purchase => {
      const key = purchase.userEmail;
      
      if (statsMap.has(key)) {
        const existing = statsMap.get(key)!;
        existing.totalTickets += purchase.quantity;
        existing.totalSpent += purchase.totalPrice;
        existing.orderCount += 1;
        
        if (new Date(purchase.purchaseDate) > new Date(existing.lastPurchase)) {
          existing.lastPurchase = purchase.purchaseDate;
        }
      } else {
        statsMap.set(key, {
          userName: purchase.userName,
          userEmail: purchase.userEmail,
          totalTickets: purchase.quantity,
          totalSpent: purchase.totalPrice,
          lastPurchase: purchase.purchaseDate,
          orderCount: 1
        });
      }
    });

    return Array.from(statsMap.values());
  };

  useEffect(() => {
    fetchTicketPurchases();
  }, [user]);

  return {
    purchases,
    loading,
    attendanceStats: getAttendanceStats(),
    refetch: fetchTicketPurchases
  };
};
