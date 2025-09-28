import type { Message } from '@/types/messaging';
import { MessageStatus, MessageType } from '@/types/messaging';
import { formatMessageTime } from '@/utils/messageFormatters';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { User } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onRetry?: () => void;
  onAction?: (action: string) => void;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showAvatar = true, 
  onRetry, 
  onAction 
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = () => {
    switch (message.status) {
      case MessageStatus.SENT:
        return <DoneOutlinedIcon style={styles.statusIcon} />;
      case MessageStatus.DELIVERED:
        return <DoneOutlinedIcon style={styles.statusIcon} />;
      case MessageStatus.READ:
        return <CheckCircleOutlinedIcon style={styles.statusIconRead} />;
      case MessageStatus.FAILED:
        return (
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case MessageType.LOCATION:
        return (
          <View style={styles.locationContent}>
            <LocationOnOutlinedIcon style={styles.locationIcon} />
            <Text style={[
              styles.messageText,
              isOwn ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {message.content}
            </Text>
          </View>
        );
      
      case MessageType.SYSTEM:
        return (
          <View style={styles.systemContent}>
            <Text style={styles.systemText}>{message.content}</Text>
          </View>
        );
      
      default:
        return (
          <Text style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
        );
    }
  };

  if (message.type === MessageType.SYSTEM) {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          {renderMessageContent()}
          <Text style={styles.systemTimestamp}>
            {formatMessageTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      {!isOwn && showAvatar && (
        <View style={styles.avatar}>
          <User size={16} color="#667eea" />
        </View>
      )}
      
      <View style={styles.bubbleContainer}>
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
            message.status === MessageStatus.FAILED && styles.failedBubble
          ]}
          onLongPress={() => setShowActions(!showActions)}
        >
          {renderMessageContent()}
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.timestamp,
              isOwn ? styles.ownTimestamp : styles.otherTimestamp
            ]}>
              {formatMessageTime(message.timestamp)}
            </Text>
            
            {isOwn && (
              <View style={styles.statusContainer}>
                {getStatusIcon()}
              </View>
            )}
          </View>
        </TouchableOpacity>

        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onAction?.('copy')}
            >
              <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
            
            {isOwn && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onAction?.('delete')}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowActions(false)}
            >
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubbleContainer: {
    maxWidth: '75%',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  failedBubble: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 16,
    color: 'currentColor',
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemBubble: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
  },
  systemContent: {
    alignItems: 'center',
  },
  systemText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  systemTimestamp: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: '#999',
  },
  statusContainer: {
    marginLeft: 8,
  },
  statusIcon: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusIconRead: {
    fontSize: 12,
    color: '#4caf50',
  },
  retryText: {
    fontSize: 11,
    color: '#f44336',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
});