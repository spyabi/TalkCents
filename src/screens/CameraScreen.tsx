import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
//https://arcdev.medium.com/how-to-convert-an-image-into-base64-in-react-native-cbadbe72ec78

export default function CameraScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const device = useCameraDevice('back')
  const cameraRef = useRef<Camera>(null);

  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  if (!device) {
    console.log('permissions', 'I AM HERE')
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading camera...</Text>
      </View>
    );
  } else{
    console.log('permissions', 'I SHOULD BE SUCCESSFUL')
  }

  const takePhoto = async () => {
    console.log('permissions', cameraRef.current);
    if (cameraRef.current) {
      console.log('permissions', "IM HERE");
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      console.log('permissions Photo URI:', `file://${photo.path}`);
      // conversion to base64
      const base64Uri = await convertImageToBase64(photo.path);
      // handleSendImage(`file://${photo.path}`) or do something with the URI
      // Call the callback passed from ChatBotScreen
      if (base64Uri) {
        setPhotoBase64(base64Uri); // switch to preview mode
      } else {
        console.warn('Failed to convert photo to Base64');
      }
//       if (base64Uri) {
//         console.log('permissions', "IM DONE CONVERTING AND SENDING BACK");
//         if (route.params?.onSendImage) {
//           route.params.onSendImage(base64Uri); // Call callback from ChatBotScreen
//         }
//         // Go back only AFTER sending
//         navigation.goBack();
//       } else {
//         console.warn('permissions', "Base64 conversion failed, not sending.");
//       }
    }
  };

//   const pickFromGallery = async () => {
//     const result = await launchImageLibrary({
//       mediaType: 'photo',
//       includeBase64: false,
//       quality: 0.8,
//     });
//
//     if (result.assets && result.assets.length > 0) {
//       const uri = result.assets[0].uri;
//       if (uri) {
//         console.log('Picked from gallery:', uri);
//         // handleSendImage(uri) or do something with the URI
//       }
//     }
//   };

  const sendPhoto = () => {
    if (photoBase64 && route.params?.onSendImage) {
      route.params.onSendImage(photoBase64, caption);
    }
    navigation.goBack();
  };

  const convertImageToBase64 = async (imagePath) => {
    try {
      const base64 = await RNFS.readFile(imagePath, 'base64');
      console.log('permissions', "IM DONE CONVERTING");
      return base64;
    } catch (error) {
      console.error('permissions Error converting image to base64:', error);
      return null;

    }

  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Show camera only if no photo taken */}
          {!photoBase64 ? (
            <>
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
              />

              <View style={styles.controls}>
                <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                  <View style={styles.innerCircle} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Photo preview with input */
            <View style={{ flex: 1 }}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${photoBase64}` }}
                style={StyleSheet.absoluteFill}
                resizeMode="contain"
              />

              <View style={styles.previewInputContainer}>
                <TextInput
                  style={[styles.textInput, { height: Math.max(40, inputHeight) }]}
                  placeholder="Add a caption..."
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  onContentSizeChange={e =>
                    setInputHeight(e.nativeEvent.contentSize.height)
                  }
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendPhoto}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  controls: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  previewInputContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});