import type { UserStatusInfo } from '@/types/messaging';
import { UserStatus as Status } from '@/types/messaging';
import { formatLastSeen } from '@/utils/messageFormatters';
import { StyleSheet, Text, View } from 'react-native';

interface UserStatusProps {
  userStatus: UserStatusInfo;
  showLastSeen?: boolean;
}

export function UserStatus({ userStatus, showLastSeen = true }: UserStatusProps) {
  const getStatusColor = () => {
    switch (userStatus.status) {
      case Status.ONLINE:
        return '#4caf50';
      case Status.TYPING:
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const getStatusText = () => {
    switch (userStatus.status) {
      case Status.ONLINE:
        return 'Online';
      case Status.TYPING:
        return 'Typing...';
      default:
        return showLastSeen ? formatLastSeen(userStatus.lastSeen) : 'Offline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default UserStatus;