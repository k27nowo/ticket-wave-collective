
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Scan } from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  ticketInfo?: {
    ticketNumber: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    ticketType: string;
    validatedAt?: string;
  };
  usedAt?: string;
}

const TicketValidator = () => {
  const [qrCode, setQrCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validateTicket = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    setValidating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('validate-ticket', {
        body: { qrCode: qrCode.trim() }
      });

      if (error) throw error;

      setResult(data);

      if (data.valid) {
        toast.success('Ticket validated successfully!');
      } else {
        toast.error(data.error || 'Invalid ticket');
      }
    } catch (error: any) {
      console.error('Error validating ticket:', error);
      toast.error('Failed to validate ticket');
      setResult({
        valid: false,
        error: 'Validation failed - please try again'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateTicket();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Ticket Validator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="Enter QR code data or scan code"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <Button 
            onClick={validateTicket}
            disabled={validating}
            className="w-full"
          >
            {validating ? 'Validating...' : 'Validate Ticket'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              {result.valid ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <Badge variant={result.valid ? "default" : "destructive"}>
                {result.valid ? 'VALID' : 'INVALID'}
              </Badge>
            </div>

            {result.ticketInfo && (
              <div className="space-y-2 text-sm">
                <div><strong>Ticket:</strong> {result.ticketInfo.ticketNumber}</div>
                <div><strong>Event:</strong> {result.ticketInfo.eventTitle}</div>
                <div><strong>Type:</strong> {result.ticketInfo.ticketType}</div>
                <div><strong>Date:</strong> {new Date(result.ticketInfo.eventDate).toLocaleDateString()}</div>
                <div><strong>Location:</strong> {result.ticketInfo.eventLocation}</div>
                {result.ticketInfo.validatedAt && (
                  <div><strong>Validated:</strong> {new Date(result.ticketInfo.validatedAt).toLocaleString()}</div>
                )}
              </div>
            )}

            {result.error && (
              <div className="text-red-600 text-sm mt-2">
                {result.error}
              </div>
            )}

            {result.usedAt && (
              <div className="text-orange-600 text-sm mt-2">
                Previously used on: {new Date(result.usedAt).toLocaleString()}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TicketValidator;
