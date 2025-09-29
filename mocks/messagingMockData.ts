import { ConversationType, MessageStatus, MessageType, UserStatus } from '@/types/messaging';

// Mock data for messaging system
export const mockMessages = [
  {
    id: 'msg1',
    threadId: 'thread1',
    senderId: 'driver1',
    receiverId: 'passenger1',
    content: "Hi! I've confirmed your booking for tomorrow's ride to Douala.",
    type: MessageType.TEXT,
    status: MessageStatus.READ,
    timestamp: new Date(Date.now() - 3600000),
    rideId: 'ride1'
  },
  {
    id: 'msg2',
    threadId: 'thread1',
    senderId: 'passenger1',
    receiverId: 'driver1',
    content: "Great! What time should I be ready?",
    type: MessageType.TEXT,
    status: MessageStatus.READ,
    timestamp: new Date(Date.now() - 3000000),
    rideId: 'ride1'
  },
  {
    id: 'msg3',
    threadId: 'thread1',
    senderId: 'driver1',
    receiverId: 'passenger1',
    content: "I'll pick you up at 8:00 AM. Please be ready 5 minutes early.",
    type: MessageType.TEXT,
    status: MessageStatus.DELIVERED,
    timestamp: new Date(Date.now() - 1800000),
    rideId: 'ride1'
  },
  {
    id: 'msg4',
    threadId: 'thread2',
    senderId: 'passenger2',
    receiverId: 'driver2',
    content: "Thank you for the smooth ride!",
    type: MessageType.TEXT,
    status: MessageStatus.READ,
    timestamp: new Date(Date.now() - 7200000),
    rideId: 'ride2'
  },
  {
    id: 'msg5',
    threadId: 'thread1',
    senderId: 'driver1',
    receiverId: 'passenger1',
    content: "I'm on my way to pick you up!",
    type: MessageType.SYSTEM,
    status: MessageStatus.DELIVERED,
    timestamp: new Date(Date.now() - 300000),
    rideId: 'ride1',
    metadata: {
      systemAction: 'driver_en_route'
    }
  }
] as const;

export const mockThreads = [
  {
    id: 'thread1',
    participants: ['driver1', 'passenger1'],
    rideId: 'ride1',
    bookingId: 'booking1',
    type: ConversationType.RIDE_BOOKING,
    lastMessage: mockMessages[4],
    unreadCount: 1,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 300000)
  },
  {
    id: 'thread2',
    participants: ['driver2', 'passenger2'],
    rideId: 'ride2',
    bookingId: 'booking2',
    type: ConversationType.RIDE_BOOKING,
    lastMessage: mockMessages[3],
    unreadCount: 0,
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 7200000)
  }
];

export const mockUserStatuses = {
  'driver1': { 
    userId: 'driver1',
    status: UserStatus.ONLINE, 
    lastSeen: new Date(),
    isTyping: false
  },
  'passenger1': { 
    userId: 'passenger1',
    status: UserStatus.OFFLINE, 
    lastSeen: new Date(Date.now() - 1800000),
    isTyping: false
  },
  'driver2': { 
    userId: 'driver2',
    status: UserStatus.ONLINE, 
    lastSeen: new Date(),
    isTyping: false
  },
  'passenger2': { 
    userId: 'passenger2',
    status: UserStatus.OFFLINE, 
    lastSeen: new Date(Date.now() - 3600000),
    isTyping: false
  }
} as const;

// ... existing code ...