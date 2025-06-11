
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { getRoleBadgeColor } from "@/utils/teamUtils";

const roles = [
  { value: "Admin", label: "Admin", description: "Full access to all features" },
  { value: "Ticket Scanning", label: "Ticket Scanning", description: "Can scan and validate tickets" },
  { value: "Aufbau", label: "Aufbau", description: "Event setup and preparation" },
  { value: "Abbau", label: "Abbau", description: "Event breakdown and cleanup" }
];

export const RoleDescriptions = () => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm mt-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-600" />
          <span>Role Descriptions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => (
            <div key={role.value} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{role.label}</h3>
                <Badge className={getRoleBadgeColor(role.value)}>
                  {role.value}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
