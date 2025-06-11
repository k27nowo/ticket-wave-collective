
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, CheckCircle, Info } from "lucide-react";
import { Customer } from "@/types/newsletter";
import CustomerDetails from "./CustomerDetails";
import { useState } from "react";

interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomers: number[];
  sentEmails: number[];
  onCustomerToggle: (customerId: number) => void;
  onSelectAll: () => void;
}

const CustomerSelector = ({
  customers,
  selectedCustomers,
  sentEmails,
  onCustomerToggle,
  onSelectAll
}: CustomerSelectorProps) => {
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<Customer | null>(null);

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Previous Customers
            </div>
            <Badge variant="secondary">
              {selectedCustomers.length}/{customers.length} selected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select All Button */}
          <Button 
            variant="outline" 
            onClick={onSelectAll}
            className="w-full"
          >
            {selectedCustomers.length === customers.length ? "Deselect All" : "Select All"}
          </Button>

          <Separator />

          {/* Customer List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {customers.map((customer) => {
              const isSelected = selectedCustomers.includes(customer.id);
              const wasSent = sentEmails.includes(customer.id);
              
              return (
                <div
                  key={customer.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isSelected 
                      ? "border-purple-200 bg-purple-50" 
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onCustomerToggle(customer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{customer.name}</p>
                        {wasSent && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{customer.email}</p>
                      <p className="text-xs text-gray-500">Last: {customer.lastPurchase}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => setSelectedCustomerDetails(customer)}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                      <div 
                        className={`w-4 h-4 border-2 rounded cursor-pointer ${
                          isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300"
                        }`}
                        onClick={() => onCustomerToggle(customer.id)}
                      >
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <CustomerDetails
        customer={selectedCustomerDetails}
        open={!!selectedCustomerDetails}
        onOpenChange={(open) => setSelectedCustomerDetails(open ? selectedCustomerDetails : null)}
      />
    </>
  );
};

export default CustomerSelector;
