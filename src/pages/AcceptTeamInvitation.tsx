
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AcceptTeamInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to accept the team invitation.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    acceptInvitation();
  }, [user, token]);

  const acceptInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // First, get the invitation details
      const { data: invitationData, error: fetchError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (fetchError || !invitationData) {
        setError('Invitation not found or has expired');
        return;
      }

      setInvitation(invitationData);

      // Use the database function to accept the invitation
      const { data: result, error: acceptError } = await supabase
        .rpc('accept_team_invitation', { invitation_token: token });

      if (acceptError) {
        setError(acceptError.message);
        return;
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAccepted(true);
      toast({
        title: "Invitation Accepted",
        description: `You've successfully joined the team with role: ${result.role}`,
      });

      // Redirect to team page after a delay
      setTimeout(() => {
        navigate('/team');
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'An error occurred while accepting the invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
              <p>Processing your invitation...</p>
            </div>
          )}

          {error && (
            <div className="space-y-4">
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-600">Error</h3>
                <p className="text-gray-600">{error}</p>
              </div>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          )}

          {accepted && invitation && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Welcome to the Team!</h3>
                <p className="text-gray-600">
                  You've been added as: <strong>{invitation.role}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Redirecting to team page in a few seconds...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptTeamInvitation;
