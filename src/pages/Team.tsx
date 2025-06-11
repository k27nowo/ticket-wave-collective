
import { useTeam } from "@/hooks/useTeam";
import { TeamHeader } from "@/components/team/TeamHeader";
import { TeamLoading } from "@/components/team/TeamLoading";
import { TeamInviteForm } from "@/components/team/TeamInviteForm";
import { PendingInvitations } from "@/components/team/PendingInvitations";
import { TeamMembersTable } from "@/components/team/TeamMembersTable";
import { RoleDescriptions } from "@/components/team/RoleDescriptions";

const Team = () => {
  const {
    teamMembers,
    pendingInvitations,
    isLoading,
    inviteMember,
    removeMember,
    updateMemberRole,
    removeInvitation,
    resendInvitation,
    isInviting,
    isRemoving,
    isUpdating,
    isRemovingInvitation,
    isResendingInvitation,
  } = useTeam();

  const handleInvite = (email: string, role: string) => {
    inviteMember({ email, role });
  };

  const handleRemoveMember = (memberId: string) => {
    removeMember(memberId);
  };

  const handleRemoveInvitation = (invitationId: string) => {
    removeInvitation(invitationId);
  };

  const handleResendInvitation = (invitation: any) => {
    resendInvitation(invitation);
  };

  if (isLoading) {
    return <TeamLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <TeamHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamInviteForm
          onInvite={handleInvite}
          isInviting={isInviting}
          teamMembers={teamMembers}
          pendingInvitations={pendingInvitations}
        />

        <PendingInvitations 
          pendingInvitations={pendingInvitations}
          onRemoveInvitation={handleRemoveInvitation}
          onResendInvitation={handleResendInvitation}
          isRemovingInvitation={isRemovingInvitation}
          isResendingInvitation={isResendingInvitation}
        />

        <TeamMembersTable
          teamMembers={teamMembers}
          onRemoveMember={handleRemoveMember}
          isRemoving={isRemoving}
          isUpdating={isUpdating}
        />

        <RoleDescriptions />
      </main>
    </div>
  );
};

export default Team;
