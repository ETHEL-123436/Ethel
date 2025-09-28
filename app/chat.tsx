import { ConnectionStatus as ConnectionStatusBanner } from '@/app/components/messaging/ConnectionStatus';
import { MessageBubble } from '@/app/components/messaging/MessageBubble';
import { MessageInput } from '@/app/components/messaging/MessageInput';
import { TypingIndicator } from '@/app/components/messaging/TypingIndicator';
import { UserStatus } from '@/app/components/messaging/UserStatus';
import { useAuth } from '@/providers/auth-provider';
import { useMessaging } from '@/providers/messaging-provider';
import type { Message } from '@/types/messaging';
import { MessageType } from '@/types/messaging';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, FlatList, ListRenderItem } from 'react-native';

export default function ChatScreen() {
  const { threadId, userId, userName } = useLocalSearchParams<{
    threadId?: string;
    userId?: string;
    userName?: string;
  }>();

  const { user } = useAuth();
  const {
    messages,
    sendMessage,
    markAsRead,
    createThread,
    userStatuses,
    updateTypingStatus,
    connectionStatus,
    joinThread,
    leaveThread,
    threads,
  } = useMessaging();

  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(threadId);
  const flatListRef = useRef<FlatList<Message>>(null);

  const currentMessages: Message[] = useMemo(() => {
    return currentThreadId ? messages[currentThreadId] || [] : [];
  }, [currentThreadId, messages]);

  // Derive typing users from userStatuses for participants in this thread
  const typingUsers = useMemo(() => {
    if (!currentThreadId || !user) return [] as string[];
    const thread = threads.find(t => t.id === currentThreadId);
    if (!thread) return [] as string[];
    return thread.participants.filter(p => p !== user.id && userStatuses[p]?.isTyping);
  }, [currentThreadId, threads, user, userStatuses]);

  useEffect(() => {
    if (!currentThreadId && userId && user) {
      // Create a new thread if none was provided
      createThread({ participantId: userId }).then(thread => {
        setCurrentThreadId(thread.id);
      });
    }
  }, [currentThreadId, userId, user, createThread]);

  useEffect(() => {
    if (currentThreadId) {
      joinThread(currentThreadId);

      // Mark messages as read where current user is receiver and status not read
      const unreadMessages = currentMessages
        .filter(msg => msg.receiverId === user?.id && msg.status !== 'read')
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        markAsRead(currentThreadId, unreadMessages);
      }

      return () => {
        leaveThread(currentThreadId);
      };
    }
  }, [currentThreadId, currentMessages, user?.id, joinThread, leaveThread, markAsRead]);

  // Keep list scrolled to bottom on new content
  useEffect(() => {
    const timeout = setTimeout(() => {
      // @ts-expect-error scrollToEnd exists on underlying ScrollView
      flatListRef.current?.scrollToEnd?.({ animated: true });
    }, 100);
    return () => clearTimeout(timeout);
  }, [currentMessages.length]);

  const handleSendMessage = useCallback(async (content: string, type: 'text' | 'location' = 'text') => {
    if (!currentThreadId || !userId || !user) return;

    await sendMessage({
      threadId: currentThreadId,
      senderId: user.id,
      receiverId: userId,
      content,
      type: type === 'location' ? MessageType.LOCATION : MessageType.TEXT,
    });
  }, [currentThreadId, userId, user, sendMessage]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (currentThreadId) {
      updateTypingStatus(currentThreadId, isTyping);
    }
  }, [currentThreadId, updateTypingStatus]);

  const handleCall = useCallback(() => {
    // Placeholder for call action
    // Implement with deep link to dialer or VoIP integration
    // e.g., Linking.openURL(`tel:${phone}`)
  }, []);

  const renderItem: ListRenderItem<Message> = useCallback(({ item }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === user?.id}
      onAction={() => { /* copy/delete action handled in future */ }}
    />
  ), [user?.id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: (userName as string) || 'Chat',
          headerTitleStyle: { fontSize: 18 },
        }}
      />

      <View style={styles.container}>
        <ConnectionStatusBanner status={connectionStatus} />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={currentMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContent}
          />

          <View style={styles.footer}>
            <TypingIndicator users={typingUsers} visible={typingUsers.length > 0} />
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              onCall={handleCall}
              placeholder="Type a message..."
              disabled={!currentThreadId}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  flex: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 12,
  },
  footer: {
    backgroundColor: 'white',
  },
});
