import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { User } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface TypingIndicatorProps {
  users: string[];
  visible: boolean;
}

export function TypingIndicator({ users, visible }: TypingIndicatorProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible || users.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return 'is typing...';
    } else if (users.length === 2) {
      return 'are typing...';
    } else {
      return `${users.length} people are typing...`;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={styles.messageContainer}>
        <View style={styles.avatar}>
          <User size={16} color="#667eea" />
        </View>
        
        <View style={styles.bubbleContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingContent}>
              <MoreHorizOutlinedIcon style={styles.typingIcon} />
              <Text style={styles.typingText}>{getTypingText()}</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  typingBubble: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingIcon: {
    fontSize: 16,
    color: '#999',
  },
  typingText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default TypingIndicator;