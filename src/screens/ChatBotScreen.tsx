import React, { useState, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Platform,
  TouchableWithoutFeedback,
  Button,
  Keyboard,
  ScrollView,
  TouchableOpacity,
  PermissionsAndroid,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
//https://reactnative.dev/docs/keyboardavoidingview
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import type { ChatHistory } from '../utils/chatbotAPI.ts';
import { sendChatMessage, transcribeAudio, createApprovedExpense } from '../utils/chatbotAPI.ts';

type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }
  | { type: 'audio'; audioUri: string }
  | { type: 'expense'; text: string };


export type Message = {
  role: 'user' | 'assistant';
  content: MessageContent[]
};

export type Expense = {
  name: string;
  date_of_expense: string;
  amount: number;
  category: string;
  notes?: string;
  status: 'Pending' | 'Approved';
};

export default function ChatBotScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState<Message[]>([]);
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [chatHistory, setchatHistory] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // Initial message
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: `Hello! 👋 I can help you log your expenses. For example:
Burger $5 yesterday, Coffee $2 today

You can also:
  - Take a picture of your receipt with/without a caption 📸
  - Tell me your expenses using your voice 🎤
  - Correct me if I got something wrong (e.g., "No, it was $5, not $10") ✏️

I’ll parse everything and ask for your approval before saving!`
        }
      ],
    },
  ]);


  const getAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions','All permissions granted');
        } else {
          console.log('permissions','All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn('permissions', err);
        return;
      }
    }
  }

  const sendMessage = async () => {
    if (message.trim()) {
      const newMessage: Message = {
        role: 'user',
        content: [{
          type: 'text',
          text: message.trim()
        }]
      };
      //use local variable to pass api call, react state updates only changes later
      const updatedChatHistory = [...chatHistory, newMessage];
      setMessages(prev => [...prev, newMessage]);
      setchatHistory(updatedChatHistory);
      console.log('permissions', "I SET CHAT HISTORY");
      console.log('permissions', messages);
      console.log('permissions', chatHistory);
      //reset the user message text box
      setMessage('');
      setInputHeight(40); // reset text input height
      // 3. Send to API
      await handleBotResponse(updatedChatHistory);
    }
  };
  const handleBotResponse = async (updatedChatHistory: Message[]) => {
    try {
      const botResponse = await sendChatMessage(updatedChatHistory);

      // 4. Add bot message to UI
      if (botResponse?.response?.length) {
        const newBotMessage: Message = {
          role: 'assistant',
          content: [{
            type: 'text',
            text: botResponse.response
          }]
        };
        setMessages(prev => [...prev, newBotMessage]);
        setchatHistory(prev => [...prev, newBotMessage]);
      }
      if (botResponse?.expense?.length) {
        // Map API response to Expense type
        const newExpenses: Expense[] = botResponse.expense.map(exp => ({
          name: exp.name,
          date_of_expense: exp.date_of_expense,
          amount: exp.price,
          category: exp.category,
          notes: exp.notes || '',
          status: 'Approved',
        }));
        // Replace the existing array
        setExpenses(newExpenses);
        console.log('permissions', "MY EXPENSES ARE", newExpenses)
        const expenseText = botResponse.expense
          .map((exp, index) => {
            // Use Markdown for formatting: ** for bold.
            const expenseHeader = `**Expense ${index + 1}**\n`;
            const nameAndPrice = `${exp.name} --- $${exp.price.toString()}\n`;
            const category = `${exp.category}\n`;
            const date = `${exp.date_of_expense}`
            return `${expenseHeader}${nameAndPrice}${category}${date}`;
          })
          .join('\n----------------\n\n');
        const newBotExpense: Message = {
          role: 'assistant',
          content: [{
            type: 'expense',
            text: expenseText
          }]
        };
        setMessages(prev => [...prev, newBotExpense]);
      }
    } catch (err) {
      const newBotError: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: "There was an issue getting your response, please try again"
        }]
      };
      setMessages(prev => [...prev, newBotError]);
      console.error('permissions', 'Error sending chat message:', err);
    }
  };

  const startRecording = async () => {
    await getAndroidPermission();
    setIsRecording(true);
    setRecordingTime(0);
    // Recording
    // Set up recording progress listener
    Sound.addRecordBackListener((e: RecordBackType) => {
      console.log('Recording progress:', e.currentPosition, e.currentMetering);
      console.log('permissions', e.currentPosition);
      console.log('permissions', Sound.mmssss(Math.floor(e.currentPosition)));
    });

    const result = await Sound.startRecorder();
    console.log('permissions', 'Recording started:', result);
    //Timer
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordingTime(elapsed);
    }, 100); // update every 100ms

  };

  const stopRecording = async () => {
    const result = await Sound.stopRecorder();
    Sound.removeRecordBackListener();
    console.log('permissions','Recording stopped:', result);
    console.log('permissions','Audio saved at:', result);
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Save recording here
    // Add recorded audio as a message
    if (result) {
      const newMessage: Message = {
        role: 'user',
        content: [{
          type: 'audio',
          audioUri: result
        }]
      };

      setMessages(prev => [...prev, newMessage]);
      handleRecordedAudio(result);
    }
  };

  const handleRecordedAudio = async (audioUri: string) => {
    try {
      // Transcribe audio
      const transcription = await transcribeAudio(audioUri);
      console.log('permissions', "MY TRANSCRIPTION", transcription)

      // Create message from transcription
      const newMessage: Message = {
        role: 'user',
        content: [{
          type: 'text',
          text: transcription.transcription
        }]
      };
      const updatedChatHistory = [...chatHistory, newMessage];
      setchatHistory(updatedChatHistory);

      await handleBotResponse(updatedChatHistory);
    } catch (err) {
      const newBotError: Message = {
        role: 'assistant',
        content: [{
          type: 'text',
          text: "There was an issue getting your response, please try again"
        }]
      };
      setMessages(prev => [...prev, newBotError]);
      console.log('permissions', 'Error handling recorded audio:', err);
    }
  };


  const cancelRecording = async () => {
    // Stop recording if it’s still running
    await nitroStopRecording({ discard: true });
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

  const playAudio = async (uri: string) => {
    if (playingId === uri && isPlaying) {
      // if already playing, pause it
      await Sound.pausePlayer();
      setIsPlaying(false);
      return;
    }

    if (playingId !== uri) {
      // if switching to a new message, stop previous one
      await Sound.stopPlayer();
    }
    setPlayingId(uri);
    setIsPlaying(true);

    await Sound.startPlayer(uri);
    Sound.setVolume(1);

    Sound.addPlaybackEndListener(() => {
      setIsPlaying(false);
      setPlayingId(null);
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handles it in Info.plist
  };

  const openCameraScreen = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;
    navigation.navigate('CameraScreen', { onSendImage: handleSendImage });
  };

  const handleSendImage = (uri: string, caption: string) => {
    if (!uri) return;

    const imageContent: MessageContent = {
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${uri}` },
    };
    // Create optional caption content (text)
    console.log('permissions', caption)
    const messageContent: MessageContent | null = caption.trim()
      ? { type: 'text', text: caption.trim() }
      : null;

    // Construct final Message for chatHistory
    const newMessage: Message = {
      role: 'user',
      content: messageContent ? [imageContent, messageContent] : [imageContent],
    };
    setMessages(prev => [...prev, newMessage]);
    const updatedChatHistory = [...chatHistory, newMessage];
    setchatHistory(updatedChatHistory);
    handleBotResponse(updatedChatHistory);

    console.log('permissions', 'Image stored in setMessages');
  };

  const lastExpenseIndex = messages
    .map((msg, idx) => ({ msg, idx }))
    .filter(({ msg }) => msg.content[0].type === 'expense')
    .map(({ idx }) => idx)
    .pop(); // gets the last one or undefined if none

  const sendExpenses = async () => {
    try {
      const response = await createApprovedExpense(expenses);
      Alert.alert('Success', 'Expenses approved successfully!');
      return response;
    } catch (error: any) {
      console.error('Error approving expenses:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to approve expenses. Please try again.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.container}>
      {/*<TouchableWithoutFeedback onPress={Keyboard.dismiss}>*/}
        <View style={styles.inner}>
          {/* Chat messages */}
          {/* <ScrollView
            style={styles.chatContainer}
            // flex end makes the msgs move to the bottom
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', padding: 0}}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }>*/}
          <KeyboardAwareScrollView
            style={styles.chatContainer}
            // flex end makes the msgs move to the bottom
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 20 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            // technically this does the TouchableWithoutFeedback, need to test with/without
          >
            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageBubble,
                  msg.role === 'user'
                    ? styles.userBubble
                    : styles.botBubble,
                ]}>
                {msg.content[0].type === 'text' ? (
                  <Text style={styles.messageText}>{msg.content[0].text}</Text>
                ) : msg.content[0].type === 'audio' ? (
                  <TouchableOpacity onPress={() => playAudio(msg.content[0].audioUri!)}>
                    <Icon
                        name={playingId === msg.content[0].audioUri && isPlaying ? 'pause-circle' : 'play-circle'}
                        size={40}
                        color="#007AFF"
                      />
                  </TouchableOpacity>
                ) : msg.content[0].type === 'expense' ? (
                <>
                  <Text style={styles.messageText}>{msg.content[0].text}</Text>
                  {/*if last expense*/}
                  {idx === lastExpenseIndex && (
                    <TouchableOpacity
                      style={styles.approveall}
                      onPress={async () => {
                        console.log('permissions', "Expense approved")
                        await sendExpenses();
                        navigation.goBack();
                      }}>
                      <Text style={{ color: '000', textAlign: 'center', fontWeight: '700' }}>
                          Approve All
                      </Text>
                    </TouchableOpacity>
                    )}
                </>
                ): msg.content[0].type === 'image_url' ? (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        // Optional: navigate to a full-screen preview
                        // navigation.navigate('ImagePreviewScreen', { uri: msg.imageBase64 });
                      }}
                    >
                      <Image
                        source={{ uri: msg.content[0].image_url.url }}
                        style={{
                          width: 120,
                          height: 160,
                          borderRadius: 12,
                          marginVertical: 4,}}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    {msg.content[1]?.type === 'text' && (
                      <Text style={styles.messageText}>
                        {msg.content[1].text}
                      </Text>
                    )}
                  </>
                ) : null }
              </View>
            ))}
          {/*</ScrollView>*/}
          </KeyboardAwareScrollView>
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
                <TouchableOpacity
                  onPress={() => openCameraScreen()}
                  style={styles.iconButton}>
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
      {/*</TouchableWithoutFeedback>*/}
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
  approveall: {
    marginTop: 8,
    backgroundColor: '#BAE7EC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  }
});