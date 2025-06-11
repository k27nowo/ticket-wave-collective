
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock } from "lucide-react";
import { getRoleBadgeColor } from "@/utils/teamUtils";

interface PendingInvitationsProps {
  pendingInvitations: Array<{
    id: string;
    email: string;
    role: string;
    invited_at: string;
    expires_at: string;
  }>;
}

export const PendingInvitations = ({ pendingInvitations }: PendingInvitationsProps) => {
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
