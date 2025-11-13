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

type Message = {
  id: string;
  sender: 'user' | 'bot';
  type: 'text' | 'audio' | 'image';
  text?: string;
  audioUri?: string;
  imageBase64?: string;
};

export default function ChatBotScreen() {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputHeight, setInputHeight] = useState(40);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

//   const [pendingImages, setPendingImages] = useState<Message[]>([]);

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
        id: Date.now().toString(),
        sender: 'user',
        type: 'text',
        text: message.trim(),
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      // Simulate bot response after a short delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'bot',
            type: 'text',
            text: "This is a bot",
          },
        ]);
      }, 500);
      setInputHeight(40); // reset text input height
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
        id: Date.now().toString(),
        sender: 'user',
        type: 'audio',
        audioUri: result, // path returned by Sound.stopRecorder()
      };

      setMessages(prev => [...prev, newMessage]);
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

  const playAudio = async (uri: string, id: string) => {
    if (playingId === id && isPlaying) {
      // if already playing, pause it
      await Sound.pausePlayer();
      setIsPlaying(false);
      return;
    }

    if (playingId !== id) {
      // if switching to a new message, stop previous one
      await Sound.stopPlayer();
    }
    setPlayingId(id);
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

    const newMessageImage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'image',
      imageBase64: uri,
    };

    setMessages(prev => [...prev, newMessageImage]);

    if (caption.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        type: 'text',
        text: caption.trim(),
      };
      setMessages(prev => [...prev, newMessage]);
      console.log('permissions', 'NEW MESSAGE SET');
    }

    console.log('permissions', 'Image stored in setMessages');
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
                {msg.type === 'text' ? (
                  <Text style={styles.messageText}>{msg.text}</Text>
                ) : msg.type === 'audio' ? (
                  <TouchableOpacity onPress={() => playAudio(msg.audioUri!, msg.id)}>
                    <Icon
                        name={playingId === msg.id && isPlaying ? 'pause-circle' : 'play-circle'}
                        size={40}
                        color="#007AFF"
                      />
                  </TouchableOpacity>
                ) : msg.type === 'image' ? (
                  <TouchableOpacity
                    onPress={() => {
                      // Optional: navigate to a full-screen preview
                      // navigation.navigate('ImagePreviewScreen', { uri: msg.imageBase64 });
                    }}
                  >
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${msg.imageBase64}` }}
                      style={{
                        width: 120,
                        height: 160,
                        borderRadius: 12,
                        marginVertical: 4,}}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : null }
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