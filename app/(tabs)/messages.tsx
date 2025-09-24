import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { MessageCircle, Search, User, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

interface ChatThread {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar?: string;
}

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  
  // Mock chat threads
  const chatThreads: ChatThread[] = [
    {
      id: 'thread1',
      userId: 'driver1',
      userName: 'Jean-Paul Mbarga',
      lastMessage: 'I\'ll be there in 5 minutes',
      lastMessageTime: '2 min ago',
      unreadCount: 1,
    },
    {
      id: 'thread2',
      userId: 'passenger1',
      userName: 'Alice Kamga',
      lastMessage: 'Thank you for the ride!',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
    },
    {
      id: 'thread3',
      userId: 'driver2',
      userName: 'Marie Nguema',
      lastMessage: 'Pickup location confirmed',
      lastMessageTime: '3 hours ago',
      unreadCount: 0,
    },
  ];

  const filteredThreads = chatThreads.filter(thread =>
    thread.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatPress = (thread: ChatThread) => {
    if (!thread.userId?.trim() || !thread.userName?.trim()) return;
    
    router.push(`../chat?userId=${thread.userId}&userName=${encodeURIComponent(thread.userName)}` as any);
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
          filteredThreads.map((thread) => (
            <TouchableOpacity
              key={thread.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(thread)}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <User size={24} color="#667eea" />
                </View>
                {thread.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{thread.unreadCount}</Text>
                  </View>
                )}
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.userName}>{thread.userName}</Text>
                  <View style={styles.timeContainer}>
                    <Clock size={12} color="#999" />
                    <Text style={styles.timeText}>{thread.lastMessageTime}</Text>
                  </View>
                </View>
                <Text 
                  style={[
                    styles.lastMessage,
                    thread.unreadCount > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {thread.lastMessage}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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