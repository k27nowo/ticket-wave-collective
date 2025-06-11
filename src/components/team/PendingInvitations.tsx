
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Mail, Trash2 } from "lucide-react";
import { getRoleBadgeColor } from "@/utils/teamUtils";

interface PendingInvitationsProps {
  pendingInvitations: Array<{
    id: string;
    email: string;
    role: string;
    invited_at: string;
    expires_at: string;
    token: string;
  }>;
  onRemoveInvitation: (invitationId: string) => void;
  onResendInvitation: (invitation: any) => void;
  isRemovingInvitation: boolean;
  isResendingInvitation: boolean;
}

export const PendingInvitations = ({ 
  pendingInvitations, 
  onRemoveInvitation, 
  onResendInvitation,
  isRemovingInvitation,
  isResendingInvitation 
}: PendingInvitationsProps) => {
  if (pendingInvitations.length === 0) return null;

  return (
    <Card className="bg-white/90 backdrop-blur-sm mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-orange-600" />
          <span>Pending Invitations ({pendingInvitations.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingInvitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(invitation.role)}>
                      {invitation.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(invitation.invited_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResendInvitation(invitation)}
                        disabled={isResendingInvitation}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveInvitation(invitation.id)}
                        disabled={isRemovingInvitation}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
