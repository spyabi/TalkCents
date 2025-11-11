import React, { useState, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableWithoutFeedback,
  Button,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
//https://reactnative.dev/docs/keyboardavoidingview

export default function ChatBotScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = { text: message.trim(), sender: 'user' };
      setMessages([...messages, newMessage]);
      setMessage('');
      // Simulate bot response after a short delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: 'This is a bot response', sender: 'bot' },
        ]);
      }, 500);
      setInputHeight(40); // reset text input height
    }
  };
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    //Timer
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordingTime(elapsed);
    }, 100); // update every 100ms

    // Start actual audio recording with expo-av or react-native-audio
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Save recording here
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
    // Discard recording here
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const centiseconds = Math.floor((ms % 1000) / 10)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${seconds}:${centiseconds}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Chat messages */}
          <ScrollView
            style={styles.chatContainer}
            // flex end makes the msgs move to the bottom
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 0}}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }>
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user'
                    ? styles.userBubble
                    : styles.botBubble,
                ]}>
                <Text>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Input area */}
          <View style={styles.inputRow}>
            {/*Text input / recording*/}
            {isRecording ? (
              // Recording UI
              <View style={styles.recordingContainer}>
                <Text>Recording: {formatTime(recordingTime)}</Text>
                <TouchableOpacity onPress={() => stopRecording()}>
                  <Text>Stop & Send</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => cancelRecording()}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="camera" size={30} color="#007AFF" />
                </TouchableOpacity>

                {/* Text input UI*/}
                <TextInput
                  style={[styles.textInput, { height: Math.max(40, inputHeight) }]}
                  placeholder="Type a message"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  onContentSizeChange={(e) =>
                    setInputHeight(e.nativeEvent.contentSize.height)
                  }
                />

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => {
                    if (message.trim()) sendMessage();
                    else startRecording();
                  }}>
                  <Icon name={message.trim() ? 'send-sharp' : 'mic'} size={30} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  inner: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  titleContainer: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '600', marginLeft: 8 },
  chatContainer: { flex: 1, padding: 12 },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '70%',
  },
  userBubble: {
    backgroundColor: '#BAE7EC',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 6,
    backgroundColor: '#fff',
  },
  recordingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: '#BAE7EC',
    borderRadius: 20,
    paddingVertical: 10,
    marginBottom:5,
  },
  iconButton: {
    padding: 8,
  },
});