import NetworkWifi3BarOutlinedIcon from '@mui/icons-material/NetworkWifi3BarOutlined';
import SignalWifiStatusbarNullOutlinedIcon from '@mui/icons-material/SignalWifiStatusbarNullOutlined';
import { ConnectionStatus as Status } from '@/types/messaging';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

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
          icon: <NetworkWifi3BarOutlinedIcon style={styles.icon} />
        };
      case Status.RECONNECTING:
        return {
          text: 'Reconnecting...',
          color: '#ff9800',
          icon: <NetworkWifi3BarOutlinedIcon style={styles.icon} />
        };
      case Status.DISCONNECTED:
        return {
          text: 'Disconnected',
          color: '#f44336',
          icon: <SignalWifiStatusbarNullOutlinedIcon style={styles.icon} />
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
        <Text style={styles.text}>{config.text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
  icon: {
    fontSize: 16,
    color: 'white',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});