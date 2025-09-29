import { useAuth } from '@/providers/auth-provider';
import type { Message, ConversationThread, UserStatusInfo } from '@/types/messaging';
import { ConnectionStatus, MessageStatus, ConversationType } from '@/types/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface MessagingContextType {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  
  // Messages
  messages: Record<string, Message[]>;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  markAsRead: (threadId: string, messageIds: string[]) => Promise<void>;
  
  // Threads
  threads: ConversationThread[];
  createThread: (params: { rideId?: string; bookingId?: string; participantId: string }) => Promise<ConversationThread>;
  
  // User status
  userStatuses: Record<string, UserStatusInfo>;
  updateTypingStatus: (threadId: string, isTyping: boolean) => void;
  
  // Real-time events
  joinThread: (threadId: string) => void;
  leaveThread: (threadId: string) => void;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatusInfo>>({});
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<Record<string, number>>({});

  const loadMockData = useCallback(async () => {
    // Load mock data for demonstration
    const { mockMessages, mockThreads, mockUserStatuses } = await import('@/mocks/messagingMockData');

    // Group messages by thread
    const messagesByThread: Record<string, Message[]> = {};
    mockMessages.forEach(msg => {
      if (!messagesByThread[msg.threadId]) {
        messagesByThread[msg.threadId] = [];
      }
      messagesByThread[msg.threadId].push(msg);
    });

    setMessages(messagesByThread);
    setThreads([...mockThreads]);
    setUserStatuses({ ...mockUserStatuses });
  }, []);

  const loadOfflineMessages = useCallback(async () => {
    try {
      const offlineMessages = await AsyncStorage.getItem('offline_messages');
      if (offlineMessages) {
        const parsedMessages = JSON.parse(offlineMessages);
        // Process offline messages
        console.log('Loaded offline messages:', parsedMessages);
      }
    } catch (error) {
      console.error('Failed to load offline messages:', error);
    }
  }, []);

  const saveOfflineMessage = useCallback(async (message: Message) => {
    try {
      const offlineMessages = await AsyncStorage.getItem('offline_messages');
      const messages = offlineMessages ? JSON.parse(offlineMessages) : [];
      messages.push(message);
      await AsyncStorage.setItem('offline_messages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save offline message:', error);
    }
  }, []);

  const connectRef = useRef<(() => void) | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus(ConnectionStatus.RECONNECTING);
      if (connectRef.current) {
        connectRef.current();
      }
    }, 5000);
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnectionStatus(ConnectionStatus.DISCONNECTED);

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!user?.token) {
      console.log('No user token available for messaging connection');
      return;
    }

    console.log('Attempting to connect messaging with token:', user.token);
    setConnectionStatus(ConnectionStatus.CONNECTING);

    // Use environment variable for WebSocket URL with fallback
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws?token=${user.token}`;

    console.log('WebSocket URL:', wsUrl);

    try {
      // For development, simulate connection since WebSocket might not be available
      setTimeout(() => {
        console.log('Messaging connection established (simulated)');
        setConnectionStatus(ConnectionStatus.CONNECTED);
        loadOfflineMessages();
      }, 1000);

      // Load mock data for now
      loadMockData();

    } catch (error) {
      console.error('Messaging connection failed:', error);
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      scheduleReconnect();
    }
  }, [user?.token, loadMockData, loadOfflineMessages, scheduleReconnect]);

  // Set the ref after connect is defined
  connectRef.current = connect;

  const sendMessage = useCallback(async (messageData: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    console.log('Sending message:', messageData);
    console.log('Current connection status:', connectionStatus);

    const message: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: MessageStatus.SENDING // Always start as sending, let the UI handle the actual sending
    };

    console.log('Created message:', message);

    // Add message to local state immediately
    setMessages(prev => ({
      ...prev,
      [message.threadId]: [...(prev[message.threadId] || []), message]
    }));

    // Always attempt to send, even if not connected (will be saved offline)
    if (connectionStatus === ConnectionStatus.CONNECTED || connectionStatus === ConnectionStatus.CONNECTING) {
      console.log('Connection is active, simulating message sending...');
      // Simulate sending message
      setTimeout(() => {
        console.log('Simulating message sent for:', message.id);
        setMessages(prev => ({
          ...prev,
          [message.threadId]: prev[message.threadId].map(msg =>
            msg.id === message.id ? { ...msg, status: MessageStatus.SENT } : msg
          )
        }));

        // Simulate delivery
        setTimeout(() => {
          console.log('Simulating message delivered for:', message.id);
          setMessages(prev => ({
            ...prev,
            [message.threadId]: prev[message.threadId].map(msg =>
              msg.id === message.id ? { ...msg, status: MessageStatus.DELIVERED } : msg
            )
          }));
        }, 1000);
      }, 500);
    } else {
      console.log('Connection not active, saving message offline');
      // Save for offline sync
      await saveOfflineMessage(message);
      // Update status to failed after a delay to show it was attempted
      setTimeout(() => {
        console.log('Marking message as failed:', message.id);
        setMessages(prev => ({
          ...prev,
          [message.threadId]: prev[message.threadId].map(msg =>
            msg.id === message.id ? { ...msg, status: MessageStatus.FAILED } : msg
          )
        }));
      }, 2000);
    }
  }, [connectionStatus, saveOfflineMessage]);

  const markAsRead = useCallback(async (threadId: string, messageIds: string[]) => {
    setMessages(prev => ({
      ...prev,
      [threadId]: prev[threadId]?.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, status: MessageStatus.READ } : msg
      ) || []
    }));

    // Update thread unread count
    setThreads(prev => prev.map(thread => 
      thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
    ));
  }, []);

  const createThread = useCallback(async (params: { 
    rideId?: string; 
    bookingId?: string; 
    participantId: string 
  }): Promise<ConversationThread> => {
    const newThread: ConversationThread = {
      id: `thread_${Date.now()}`,
      participants: [user!.id, params.participantId],
      rideId: params.rideId,
      bookingId: params.bookingId,
      type: params.rideId ? ConversationType.RIDE_BOOKING : ConversationType.GENERAL,
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setThreads(prev => [newThread, ...prev]);
    return newThread;
  }, [user]);

  const updateTypingStatus = useCallback((threadId: string, isTyping: boolean) => {
    if (!user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current[threadId]) {
      clearTimeout(typingTimeoutRef.current[threadId]);
    }

    if (isTyping) {
      // Set typing timeout
      typingTimeoutRef.current[threadId] = setTimeout(() => {
        updateTypingStatus(threadId, false);
      }, 3000);
    }

    // Update local typing status
    setUserStatuses(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        isTyping
      }
    }));
  }, [user]);

  const joinThread = useCallback((threadId: string) => {
    // In real implementation, send join event to WebSocket
    console.log('Joining thread:', threadId);
  }, []);

  const leaveThread = useCallback((threadId: string) => {
    // In real implementation, send leave event to WebSocket
    console.log('Leaving thread:', threadId);
  }, []);

  useEffect(() => {
    console.log('Messaging provider useEffect - user:', user?.id, 'connection status:', connectionStatus);
    if (user) {
      console.log('User is logged in, attempting to connect messaging');
      connect();
    } else {
      console.log('User is not logged in, disconnecting messaging');
      disconnect();
    }

    return () => {
      console.log('Cleaning up messaging connection');
      disconnect();
    };
  }, [user, connect, disconnect]);

  const contextValue: MessagingContextType = {
    connectionStatus,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    messages,
    sendMessage,
    markAsRead,
    threads,
    createThread,
    userStatuses,
    updateTypingStatus,
    joinThread,
    leaveThread
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}