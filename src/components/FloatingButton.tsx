import React, { useState} from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../navigation/AppStack";



const FloatingButton = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [icon_2_1] = useState(new Animated.Value(40));
  const [icon_2_2] = useState(new Animated.Value(40));
  const [icon_3] = useState(new Animated.Value(40));
  const navigation = useNavigation();

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
      <Animated.View style={[styles.circle, { bottom: icon_2_1, right: icon_2_2}]}>
        <TouchableOpacity>
          <Icon name="logo-android" size={30} color="#FFFF" />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.circle, {right: icon_3}]}>
        <TouchableOpacity
        onPress={() => navigation.navigate("ManualEntry", { item: null })}
        >
          <Icon name="create" size={30} color="#FFFF" />
        </TouchableOpacity>
      </Animated.View>
      <TouchableOpacity
        style={styles.circle}
        onPress={() => {
          pop === false ? popIn() : popOut();
        }}
      >
        <Icon name="add" size={25} color="#FFFF" />
      </TouchableOpacity>
    </View>
  )

}

export default FloatingButton;

const styles = StyleSheet.create({
  circle: {
     backgroundColor: '#000000',
     width: 60,
     height: 60,
     position: 'absolute',
     bottom: 40, //repeated bottom and right, possible to fix this but itll require adjusting animated values
     right: 40, //then it will only rely on container position below
     borderRadius: 50,
     justifyContent: 'center',
     alignItems: 'center',
  },
  container: {
    position: 'absolute',
    bottom: 60,
    right: -10,
  }

})