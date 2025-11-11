import React, { useState } from 'react';
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
//   const timerRef = useRef<NodeJS.Timer | null>(null);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, message.trim()]);
      setMessage('');
    }
  };
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Optionally start a timer
    recordingInterval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    // Start actual audio recording with expo-av or react-native-audio
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval(recordingInterval);
    // Save the recording, reset timer
  };

  const cancelRecording = () => {
    setIsRecording(false);
    clearInterval(recordingInterval);
    setRecordingTime(0);
    // Discard recording
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Chat messages */}
          <ScrollView style={styles.chatContainer}>
            {messages.map((msg, idx) => (
              <View key={idx} style={styles.messageBubble}>
                <Text>{msg}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Input area */}
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="attach-outline" size={30} color="#007AFF" />
            </TouchableOpacity>
            {isRecording ? (
              // Recording UI
              <View style={styles.recordingContainer}>
                <Text>Recording: {recordingTime}s</Text>
                <TouchableOpacity onPress={() => stopRecording()}>
                  <Text>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => cancelRecording()}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Text input UI
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
            )}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (message.trim()) sendMessage();
                else setIsRecording(true);
              }}>
              <Icon name={message.trim() ? 'send-sharp' : 'mic'} size={30} color="#007AFF" />
            </TouchableOpacity>
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
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
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