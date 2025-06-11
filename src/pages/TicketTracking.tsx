
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Calendar, Download, Eye, UserCheck } from "lucide-react";
import { useTicketTracking } from "@/hooks/useTicketTracking";
import { useEvents } from "@/hooks/useEvents";

const TicketTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [viewMode, setViewMode] = useState<"purchases" | "attendance">("purchases");
  
  const { purchases, loading, attendanceStats } = useTicketTracking();
  const { events } = useEvents();

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.eventTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEvent === "all" || purchase.eventId === selectedEvent;
    
    return matchesSearch && matchesEvent;
  });

  const filteredAttendanceStats = attendanceStats.filter(user =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalRevenue = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.totalPrice, 0);
  };

  const getTotalTicketsSold = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  };

  const getUniqueCustomers = () => {
    return new Set(filteredPurchases.map(p => p.userEmail)).size;
  };

  const exportData = () => {
    const dataToExport = viewMode === "purchases" ? filteredPurchases : filteredAttendanceStats;
    const csvContent = "data:text/csv;charset=utf-8," + 
      (viewMode === "purchases" 
        ? "Customer,Email,Event,Ticket Type,Quantity,Amount,Purchase Date,Payment Method\n" +
          filteredPurchases.map(p => 
            `"${p.userName}","${p.userEmail}","${p.eventTitle}","${p.ticketType}",${p.quantity},${p.totalPrice},"${new Date(p.purchaseDate).toLocaleDateString()}","${p.paymentMethod}"`
          ).join("\n")
        : "Customer,Email,Total Tickets,Total Spent,Order Count,Last Purchase\n" +
          filteredAttendanceStats.map(u => 
            `"${u.userName}","${u.userEmail}",${u.totalTickets},${u.totalSpent},${u.orderCount},"${new Date(u.lastPurchase).toLocaleDateString()}"`
          ).join("\n")
      );

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ticket-${viewMode}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading ticket data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Tracking</h1>
          <p className="text-gray-600">Monitor ticket purchases and attendance for your events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From ticket sales</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalTicketsSold()}</div>
              <p className="text-xs text-muted-foreground">Total tickets</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredPurchases.length}</div>
              <p className="text-xs text-muted-foreground">Order records</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
              <Eye className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUniqueCustomers()}</div>
              <p className="text-xs text-muted-foreground">Different customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by customer name, email, or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "purchases" ? "default" : "outline"}
                  onClick={() => setViewMode("purchases")}
                  size="sm"
                >
                  Purchases
                </Button>
                <Button
                  variant={viewMode === "attendance" ? "default" : "outline"}
                  onClick={() => setViewMode("attendance")}
                  size="sm"
                >
                  Customer Stats
                </Button>
                <Button onClick={exportData} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>
              {viewMode === "purchases" ? "Ticket Purchases" : "Customer Statistics"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "purchases" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No ticket purchases found. Create some events and start selling tickets to see data here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{purchase.userName}</p>
                            <p className="text-sm text-gray-500">{purchase.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.eventTitle}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{purchase.ticketType}</Badge>
                        </TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>${purchase.totalPrice}</TableCell>
                        <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{purchase.paymentMethod}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Tickets</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Purchase</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No customer data found. Sell some tickets to see customer statistics here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAttendanceStats.map((user) => (
                      <TableRow key={user.userEmail}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.userName}</p>
                            <p className="text-sm text-gray-500">{user.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.totalTickets}</TableCell>
                        <TableCell>{user.orderCount}</TableCell>
                        <TableCell>${user.totalSpent}</TableCell>
                        <TableCell>{new Date(user.lastPurchase).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketTracking;
