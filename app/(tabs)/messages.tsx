import { ConversationItem } from '@/app/components/messaging/ConversationItem';
import { useAuth } from '@/providers/auth-provider';
import { useMessaging } from '@/providers/messaging-provider';
import type { ConversationThread } from '@/types/messaging';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { threads, userStatuses } = useMessaging();

  const filteredThreads = threads.filter(thread => {
    // Get the other participant's name for filtering
    const otherParticipant = thread.participants.find(p => p !== user?.id);
    const nameMap: Record<string, string> = {
      'driver1': 'Jean-Paul Mbarga',
      'driver2': 'Marie Nguema', 
      'passenger1': 'Alice Kamga',
      'passenger2': 'Robert Essomba'
    };
    const participantName = otherParticipant ? nameMap[otherParticipant] || '' : '';
    return participantName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleThreadPress = (thread: ConversationThread) => {
    const otherParticipant = thread.participants.find(p => p !== user?.id);
    const nameMap: Record<string, string> = {
      'driver1': 'Jean-Paul Mbarga',
      'driver2': 'Marie Nguema',
      'passenger1': 'Alice Kamga', 
      'passenger2': 'Robert Essomba'
    };
    const participantName = otherParticipant ? nameMap[otherParticipant] : 'Unknown';
    
    router.push(`../chat?threadId=${thread.id}&userId=${otherParticipant}&userName=${encodeURIComponent(participantName)}` as any);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView style={styles.chatsList} showsVerticalScrollIndicator={false}>
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => {
            const otherParticipant = thread.participants.find(p => p !== user?.id);
            const userStatus = otherParticipant ? userStatuses[otherParticipant] : undefined;
            
            return (
              <ConversationItem
                key={thread.id}
                thread={thread}
                userStatus={userStatus}
                onPress={handleThreadPress}
                currentUserId={user?.id || ''}
              />
            );
          })
        ) : searchQuery ? (
          <View style={styles.emptyState}>
            <Search size={48} color="#ccc" />
            <Text style={styles.emptyText}>No conversations found</Text>
            <Text style={styles.emptySubtext}>
              Try searching with a different name
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#ccc" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start a conversation with drivers or passengers
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});