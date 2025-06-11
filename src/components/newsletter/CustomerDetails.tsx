
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/newsletter";

interface CustomerDetailsProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerDetails = ({ customer, open, onOpenChange }: CustomerDetailsProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{customer.name}</h4>
            <p className="text-sm text-gray-600">{customer.email}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Events Attended</p>
              <p className="text-2xl font-bold text-blue-600">{customer.eventsAttended}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Tickets</p>
              <p className="text-2xl font-bold text-purple-600">{customer.totalTickets}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Last Purchase</p>
            <p className="text-sm text-gray-600">{customer.lastPurchase}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Attendance Rate</p>
            <Badge variant="secondary">
              {((customer.eventsAttended / customer.totalTickets) * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetails;
