// Message formatting utilities
export const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
};

export const formatLastSeen = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 5) return 'Online';
  if (minutes < 60) return `Last seen ${minutes}m ago`;
  if (hours < 24) return `Last seen ${hours}h ago`;
  return `Last seen ${days}d ago`;
};

export const formatRideStatus = (status: string): string => {
  switch (status) {
    case 'pending': return 'Booking Pending';
    case 'confirmed': return 'Ride Confirmed';
    case 'in_progress': return 'Trip in Progress';
    case 'completed': return 'Trip Completed';
    case 'cancelled': return 'Ride Cancelled';
    default: return status;
  }
};