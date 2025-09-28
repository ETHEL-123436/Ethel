import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import * as Location from 'expo-location';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'location') => void;
  onTyping: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  showQuickActions?: boolean;
  onCall?: () => void;
}

export function MessageInput({ 
  onSendMessage, 
  onTyping, 
  placeholder = "Type a message...",
  disabled = false,
  showQuickActions = true,
  onCall
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleTextChange = useCallback((text: string) => {
    setMessage(text);
    
    const newIsTyping = text.length > 0;
    if (newIsTyping !== isTyping) {
      setIsTyping(newIsTyping);
      onTyping(newIsTyping);
    }
  }, [isTyping, onTyping]);

  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping(false);
    }
  }, [message, disabled, onSendMessage, onTyping]);

  const handleShareLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      const { latitude, longitude } = location.coords;
      const address = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      onSendMessage(address, 'location');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  }, [onSendMessage]);

  return (
    <View style={styles.container}>
      {showQuickActions && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleShareLocation}
            disabled={disabled}
          >
            <LocationOnOutlinedIcon style={styles.quickActionIcon} />
          </TouchableOpacity>
          
          {onCall && (
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={onCall}
              disabled={disabled}
            >
              <PhoneOutlinedIcon style={styles.quickActionIcon} />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!disabled}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.disabledSend
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <SendOutlinedIcon 
            style={[
              styles.sendIcon,
              { color: message.trim() && !disabled ? 'white' : '#ccc' }
            ]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 18,
    color: '#667eea',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSend: {
    backgroundColor: '#f0f0f0',
  },
  sendIcon: {
    fontSize: 20,
  },
});