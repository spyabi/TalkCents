import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export default function CameraScreen() {
  const device = useCameraDevice('back')
  const cameraRef = useRef<Camera>(null);

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
      // handleSendImage(`file://${photo.path}`) or do something with the URI
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

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={console.log('permissions, pickFromGallery')} style={styles.galleryButton}>
          <Icon name="images" size={40} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
          <View style={styles.innerCircle} />
        </TouchableOpacity>
      </View>
    </View>
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
    marginHorizontal: 30,
  },
  innerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});