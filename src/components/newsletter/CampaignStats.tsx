
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsletterTemplate, Customer } from "@/types/newsletter";

interface CampaignStatsProps {
  totalCustomers: number;
  selectedCustomersCount: number;
  sentEmailsCount: number;
  templatesCount: number;
}

const CampaignStats = ({
  totalCustomers,
  selectedCustomersCount,
  sentEmailsCount,
  templatesCount
}: CampaignStatsProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Campaign Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Customers</span>
          <Badge variant="secondary">{totalCustomers}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Selected</span>
          <Badge className="bg-purple-100 text-purple-700">
            {selectedCustomersCount}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Emails Sent</span>
          <Badge className="bg-green-100 text-green-700">
            {sentEmailsCount}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Templates Saved</span>
          <Badge variant="outline">
            {templatesCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignStats;
