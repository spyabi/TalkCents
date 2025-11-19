import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

import { tutorialData } from "../utils/TutorialData";

// screen width for pagination
const { width } = Dimensions.get("window");

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AppStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Tutorial">;

export default function TutorialScreen({ navigation }: Props) {
  // declare state
  const [currentIndex, setCurrentIndex] = useState(0);

  // declare ref
  const flatListRef = useRef<FlatList>(null);

  // next button logic
  const goNext = () => {
    if (currentIndex < tutorialData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace("HomeTabs");
    }
  };

  // back button logic
  const goBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  // scroll listener
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setCurrentIndex(slideIndex);
  };

  return (
    <View style={styles.container}>

      {/* Skip Button */}
      {currentIndex < tutorialData.length - 1 && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.replace("HomeTabs")}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides List */}
      <FlatList
        ref={flatListRef}
        data={tutorialData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {tutorialData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? "#007AFF" : "#d0d0d0",
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          onPress={goBack}
          disabled={currentIndex === 0}
        >
          <Text
            style={[
              styles.navText,
              { opacity: currentIndex === 0 ? 0.3 : 1 },
            ]}
          >
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goNext}>
          <Text style={styles.navText}>
            {currentIndex === tutorialData.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  skipBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  skipText: { fontSize: 16, color: "#777" },

  slide: {
    width,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  image: {
    width: width * 0.85,
    height: width * 1.4,
    resizeMode: "contain",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#555",
    marginTop: 6,
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    marginBottom: 40,
  },

  navText: { fontSize: 18, color: "#007AFF", fontWeight: "600" },
});
