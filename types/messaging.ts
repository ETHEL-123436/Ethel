// Message and conversation related enums
export enum MessageType {
  TEXT = 'text',
  LOCATION = 'location',
  SYSTEM = 'system',
  RIDE_UPDATE = 'ride_update'
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum ConversationType {
  RIDE_BOOKING = 'ride_booking',
  GENERAL = 'general'
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  TYPING = 'typing'
}

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

// Message related types
export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  rideId?: string;
  bookingId?: string;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    systemAction?: string;
  };
}

// Conversation thread types
export interface ConversationThread {
  id: string;
  participants: string[];
  rideId?: string;
  bookingId?: string;
  type: ConversationType;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// User status types
export interface UserStatusInfo {
  userId: string;
  status: UserStatus;
  lastSeen: Date;
  isTyping?: boolean;
}

// WebSocket event types
export interface SocketEvents {
  message: Message;
  messageStatus: {
    messageId: string;
    status: MessageStatus;
  };
  typing: {
    threadId: string;
    userId: string;
    isTyping: boolean;
  };
  userStatus: UserStatusInfo;
  threadUpdate: ConversationThread;
}

// API response types
export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface ThreadsResponse {
  threads: ConversationThread[];
  total: number;
  unreadTotal: number;
}