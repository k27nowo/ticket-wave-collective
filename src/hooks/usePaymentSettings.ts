
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PaymentSettingsData {
  id?: string;
  provider: 'paypal' | 'stripe';
  is_enabled: boolean;
  settings: {
    email?: string;
    publishable_key?: string;
    secret_key?: string;
  };
}

export const usePaymentSettings = () => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPaymentSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setPaymentSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching payment settings:', error);
      toast({
        title: "Error",
        description: "Failed to load payment settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePaymentSettings = async (settingsData: PaymentSettingsData) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('payment_settings')
        .upsert({
          user_id: user.id,
          provider: settingsData.provider,
          is_enabled: settingsData.is_enabled,
          settings: settingsData.settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,provider'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setPaymentSettings(prev => {
        const existing = prev.find(p => p.provider === settingsData.provider);
        if (existing) {
          return prev.map(p => p.provider === settingsData.provider ? data : p);
        } else {
          return [...prev, data];
        }
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error saving payment settings:', error);
      return { error: error.message };
    }
  };

  useEffect(() => {
    fetchPaymentSettings();
  }, [user]);

  return {
    paymentSettings,
    loading,
    savePaymentSettings,
    refetch: fetchPaymentSettings,
  };
};
