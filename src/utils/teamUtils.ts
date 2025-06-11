
export const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "Admin":
      return "bg-red-100 text-red-800 border-red-200";
    case "Ticket Scanning":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Aufbau":
      return "bg-green-100 text-green-800 border-green-200";
    case "Abbau":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getStatusBadgeColor = (status: string) => {
  return status === "active" 
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-yellow-100 text-yellow-800 border-yellow-200";
};
