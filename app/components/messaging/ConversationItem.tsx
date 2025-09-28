import type { ConversationThread, UserStatusInfo } from '@/types/messaging';
import { formatLastSeen, formatMessageTime } from '@/utils/messageFormatters';
import { Clock, User } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConversationItemProps {
  thread: ConversationThread;
  userStatus?: UserStatusInfo;
  onPress: (thread: ConversationThread) => void;
  currentUserId: string;
}

export function ConversationItem({ 
  thread, 
  userStatus, 
  onPress, 
  currentUserId 
}: ConversationItemProps) {
  // Get the other participant (not current user)
  const otherParticipant = thread.participants.find(p => p !== currentUserId);
  
  // For demo purposes, we'll use a simple name mapping
  const getParticipantName = (participantId: string) => {
    const nameMap: Record<string, string> = {
      'driver1': 'Jean-Paul Mbarga',
      'driver2': 'Marie Nguema',
      'passenger1': 'Alice Kamga',
      'passenger2': 'Robert Essomba'
    };
    return nameMap[participantId] || 'Unknown User';
  };

  const participantName = otherParticipant ? getParticipantName(otherParticipant) : 'Unknown';
  const lastMessageTime = thread.lastMessage 
    ? formatMessageTime(thread.lastMessage.timestamp)
    : formatMessageTime(thread.updatedAt);

  const statusText = userStatus ? formatLastSeen(userStatus.lastSeen) : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(thread)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <User size={24} color="#667eea" />
        </View>
        
        {thread.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </Text>
          </View>
        )}
        
        {userStatus?.status === 'online' && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{participantName}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#999" />
            <Text style={styles.timeText}>{lastMessageTime}</Text>
          </View>
        </View>
        
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.lastMessage,
              thread.unreadCount > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {thread.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
        
        {statusText && (
          <Text style={styles.statusText}>{statusText}</Text>
        )}
        
        {thread.rideId && (
          <View style={styles.rideTag}>
            <Text style={styles.rideTagText}>Ride Chat</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
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
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
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
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  statusText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  rideTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  rideTagText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
});