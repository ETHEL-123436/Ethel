import { Wifi, WifiOff } from 'lucide-react-native';
import { ConnectionStatus as Status } from '@/types/messaging';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface ConnectionStatusProps {
  status: Status;
  visible?: boolean;
}

export function ConnectionStatus({ status, visible = true }: ConnectionStatusProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (visible && status !== Status.CONNECTED) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
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
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [status, visible, fadeAnim, slideAnim]);

  const getStatusConfig = () => {
    switch (status) {
      case Status.CONNECTING:
        return {
          text: 'Connecting...',
          color: '#ff9800',
          icon: <Wifi size={16} color="white" />
        };
      case Status.RECONNECTING:
        return {
          text: 'Reconnecting...',
          color: '#ff9800',
          icon: <Wifi size={16} color="white" />
        };
      case Status.DISCONNECTED:
        return {
          text: 'Disconnected',
          color: '#f44336',
          icon: <WifiOff size={16} color="white" />
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config || !visible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { backgroundColor: config.color },
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        {config.icon}
      </View>
    </Animated.View>
  );
}

export default ConnectionStatus;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});