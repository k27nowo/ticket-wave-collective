
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign, Settings, Check, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePaymentSettings } from "@/hooks/usePaymentSettings";

const PaymentSettings = () => {
  const { toast } = useToast();
  const { paymentSettings, loading, savePaymentSettings } = usePaymentSettings();
  
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  // Load existing settings when data is fetched
  useEffect(() => {
    const paypalSettings = paymentSettings.find(p => p.provider === 'paypal');
    const stripeSettings = paymentSettings.find(p => p.provider === 'stripe');

    if (paypalSettings) {
      setPaypalEnabled(paypalSettings.is_enabled);
      setPaypalEmail(paypalSettings.settings.email || "");
    }

    if (stripeSettings) {
      setStripeEnabled(stripeSettings.is_enabled);
      setStripePublishableKey(stripeSettings.settings.publishable_key || "");
      setStripeSecretKey(stripeSettings.settings.secret_key || "");
    }
  }, [paymentSettings]);

  const handleSavePayPal = async () => {
    if (!paypalEmail && paypalEnabled) {
      toast({
        title: "Error",
        description: "Please enter your PayPal email address",
        variant: "destructive",
      });
      return;
    }

    setSaving('paypal');
    
    const { error } = await savePaymentSettings({
      provider: 'paypal',
      is_enabled: paypalEnabled,
      settings: { email: paypalEmail }
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save PayPal settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "PayPal Settings Saved",
        description: "Your PayPal configuration has been updated successfully",
      });
    }

    setSaving(null);
  };

  const handleSaveStripe = async () => {
    if ((!stripePublishableKey || !stripeSecretKey) && stripeEnabled) {
      toast({
        title: "Error",
        description: "Please enter both Stripe keys",
        variant: "destructive",
      });
      return;
    }

    setSaving('stripe');

    const { error } = await savePaymentSettings({
      provider: 'stripe',
      is_enabled: stripeEnabled,
      settings: { 
        publishable_key: stripePublishableKey,
        secret_key: stripeSecretKey 
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save Stripe settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stripe Settings Saved",
        description: "Your Stripe configuration has been updated successfully",
      });
    }

    setSaving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
              <p className="mt-2 text-gray-600">Loading payment settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
          <p className="text-gray-600">Configure your payment methods to start collecting payments from customers</p>
        </div>

        <div className="space-y-8">
          {/* PayPal Configuration */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>PayPal</CardTitle>
                    <p className="text-sm text-gray-600">Accept payments through PayPal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={paypalEnabled ? "default" : "secondary"}>
                    {paypalEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={paypalEnabled}
                    onCheckedChange={setPaypalEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-email">PayPal Business Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="your-business@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  disabled={!paypalEnabled}
                />
                <p className="text-xs text-gray-500">
                  This is the email address associated with your PayPal business account
                </p>
              </div>
              
              <Button 
                onClick={handleSavePayPal}
                disabled={!paypalEnabled || saving === 'paypal'}
                className="w-full sm:w-auto"
              >
                {saving === 'paypal' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save PayPal Settings
              </Button>
            </CardContent>
          </Card>

          {/* Stripe Configuration */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Stripe</CardTitle>
                    <p className="text-sm text-gray-600">Accept credit cards and other payment methods</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={stripeEnabled ? "default" : "secondary"}>
                    {stripeEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={stripeEnabled}
                    onCheckedChange={setStripeEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-publishable">Stripe Publishable Key</Label>
                <Input
                  id="stripe-publishable"
                  type="text"
                  placeholder="pk_test_..."
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  disabled={!stripeEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_test_..."
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  disabled={!stripeEnabled}
                />
                <p className="text-xs text-gray-500">
                  Your secret key is stored securely and never shared
                </p>
              </div>
              
              <Button 
                onClick={handleSaveStripe}
                disabled={!stripeEnabled || saving === 'stripe'}
                className="w-full sm:w-auto"
              >
                {saving === 'stripe' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Stripe Settings
              </Button>
            </CardContent>
          </Card>

          {/* Additional Payment Methods */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Additional Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Apple Pay & Google Pay</h4>
                  <p className="text-sm text-gray-600">Automatically available when Stripe is enabled</p>
                </div>
                <Badge variant="outline">Auto-enabled</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Need Help?</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    To get your Stripe keys, visit your Stripe Dashboard → Developers → API keys.
                    For PayPal, you'll need a PayPal Business account.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
