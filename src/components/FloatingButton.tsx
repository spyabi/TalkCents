import React, { useState} from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Text } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../navigation/AppStack";

type Nav = NativeStackNavigationProp<AuthStackParamList>;

const FAB_COLOR = '#9DB7FF';

const FloatingButton = () => {
  const navigation = useNavigation<Nav>();
  const [icon_2_1] = useState(new Animated.Value(40));
  const [icon_2_2] = useState(new Animated.Value(40));
  const [icon_3] = useState(new Animated.Value(40));

  const [pop, setPop] = useState(false);

  const popIn = () => {
    setPop(true);
    Animated.timing(icon_2_1, {
      toValue: 130,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_2_2, {
      toValue: 60,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_3, {
      toValue: 130,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setTimeout(() => {
    popOut();
  }, 3000);
  }

  const popOut = () => {
    setPop(false);
    Animated.timing(icon_2_1, {
      toValue: 40,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_2_2, {
      toValue: 40,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(icon_3, {
      toValue: 40,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  return(
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circleSmall,
          { bottom: icon_2_1, right: icon_2_2 },
        ]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("ChatBot");}}>
          <View style={styles.menuContent}>
            <Icon name="logo-android" size={22} color="#000" />
            <Text style={styles.menuText}>AI Entry</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.circleSmall,
          { right: icon_3 },
        ]}
      >
        <TouchableOpacity onPress={() => {navigation.navigate("ManualEntry", { item: null });}}>
          <View style={styles.menuContent}>
            <Icon name="create" size={22} color="#000" />
            <Text style={styles.menuText}>Manual Entry</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>


      {/* Main + FAB */}
      <TouchableOpacity
        style={styles.circleMain}
        onPress={() => {
          pop === false ? popIn() : popOut();
        }}
      >
        <Icon name="add" size={32} color="#FFFF" />
      </TouchableOpacity>
    </View>
  );
};
//     <View style={styles.container}>
//       <Animated.View style={[styles.circle, { bottom: icon_2_1, right: icon_2_2}]}>
//         <TouchableOpacity onPress={() => navigation.navigate('ChatBot')}>
//           <View style={{ alignItems: 'center'}}>
//             <Icon name="logo-android" size={30} color="#FFFF" />
//             <Text style={{ color: '#FFFFFF', fontSize: 12, marginBottom:5 }}>AI</Text>
//           </View>
//         </TouchableOpacity>
//       </Animated.View>
//       <Animated.View style={[styles.circle, {right: icon_3}]}>
//         <TouchableOpacity onPress={() => navigation.navigate("ManualEntry", { item: null })}>
//           <View style={{ alignItems: 'center'}}>
//             <Icon name="create" size={30} color="#FFFF" />
//             <Text style={{ color: '#FFFFFF', fontSize: 12, marginBottom:5 }}>Manual</Text>
//           </View>
//         </TouchableOpacity>
//       </Animated.View>
//       <TouchableOpacity
//         style={styles.circle}
//         onPress={() => {
//           pop === false ? popIn() : popOut();
//         }}
//       >
//         <Icon name="add" size={25} color="#FFFF" />
//       </TouchableOpacity>
//     </View>
//   )

// }

export default FloatingButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 43,
    right: -15,
  },

  // main + button
  circleMain: {
    backgroundColor: FAB_COLOR,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    right: 40,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  // menu bubbles (Manual / AI)
  circleSmall: {
    backgroundColor: FAB_COLOR,
    width: 70,
    height: 70,
    position: "absolute",
    bottom: 40,
    right: 40,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  menuContent: {
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    color: "#000",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
    textAlign: "center",
  },
});

// const styles = StyleSheet.create({
//   circle: {
//      backgroundColor: '#000000',
//      width: 60,
//      height: 60,
//      position: 'absolute',
//      bottom: 40, //repeated bottom and right, possible to fix this but itll require adjusting animated values
//      right: 40, //then it will only rely on container position below
//      borderRadius: 50,
//      justifyContent: 'center',
//      alignItems: 'center',
//   },
//   container: {
//     position: 'absolute',
//     bottom: 60,
//     right: -10,
//   }

// })