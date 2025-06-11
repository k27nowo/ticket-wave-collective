
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeamInviteFormProps {
  onInvite: (email: string, role: string) => void;
  isInviting: boolean;
  teamMembers: Array<{ email: string }>;
  pendingInvitations: Array<{ email: string }>;
}

const roles = [
  { value: "Admin", label: "Admin", description: "Full access to all features" },
  { value: "Ticket Scanning", label: "Ticket Scanning", description: "Can scan and validate tickets" },
  { value: "Aufbau", label: "Aufbau", description: "Event setup and preparation" },
  { value: "Abbau", label: "Abbau", description: "Event breakdown and cleanup" }
];

export const TeamInviteForm = ({ onInvite, isInviting, teamMembers, pendingInvitations }: TeamInviteFormProps) => {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const handleInvite = () => {
    if (!inviteEmail || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please enter an email and select a role.",
        variant: "destructive"
      });
      return;
    }

    // Check if email is already invited or is a team member
    const isAlreadyInvited = pendingInvitations.some(inv => inv.email === inviteEmail);
    const isAlreadyMember = teamMembers.some(member => member.email === inviteEmail);

    if (isAlreadyInvited) {
      toast({
        title: "Already Invited",
        description: "This email has already been invited to the team.",
        variant: "destructive"
      });
      return;
    }

    if (isAlreadyMember) {
      toast({
        title: "Already a Member",
        description: "This email is already a team member.",
        variant: "destructive"
      });
      return;
    }

    onInvite(inviteEmail, selectedRole);
    setInviteEmail("");
    setSelectedRole("");
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5 text-purple-600" />
          <span>Invite Team Member</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="bg-white"
              disabled={isInviting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isInviting}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleInvite}
              disabled={isInviting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
