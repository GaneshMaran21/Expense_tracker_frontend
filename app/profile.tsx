import React, { useRef, useState, useEffect } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
  BackHandler,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./utils/color";
import LottieView from "lottie-react-native";
import Button from "@/component/button";
import { Dimensions } from "react-native";
import {  useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
const profile = () => {
  const router = useRouter()
  const theme = useTheme() // Reactive theme hook
  
  // Prevent back navigation on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Return true to prevent default back behavior
        return true;
      });

      return () => backHandler.remove();
    }
  }, []);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const goToNextPage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const nextPage = currentPage + 1;
    if (nextPage < 3) {
      // 3 pages total
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          x: SCREEN_WIDTH * nextPage,
          animated: true,
        });
      }
      setCurrentPage(nextPage);
    }
  };
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };
  // const un_color = useIsDark()?themeConfig.primaryL : themeConfig.primaryD
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.background,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ScrollView
        horizontal
        style={{ flex: 1 }}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        <View
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT,
            flexDirection: "column",
            alignItems: "center",
            gap: 15,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 40,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View style={{}}>
              <Image source={require("../assets/icon/wallet.png")} />
            </View>
            <View style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  color: theme.appPrimary,
                  marginTop: 10,
                }}
              >
                EX-Tracker
              </Text>
            </View>
          </View>
          <View style={{ height: 300, width: "auto" }}>
            {/* <Image source={require('../assets/icon/preview1.png')}/> */}
            {/* <Preview width={400} height={500}/> */}
            <LottieView
              source={require("../assets/lottie/Money.json")} // path to your .lottie file
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 20,
              justifyContent: "center",
              alignItems: "center",
              width: 300,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: theme.textPrimary,
              }}
            >
              Note Down Expenses
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                textAlign: "center",
                color: theme.textPrimary,
              }}
            >
              Daily Note Your Expenses to help manage money
            </Text>
          </View>
          <View style={{ padding: 16, flex: 1, width: "100%", marginTop: 30 }}>
            <Button title="Continue" onPress={goToNextPage} />
          </View>
        </View>
        <View
          style={{
            width: SCREEN_WIDTH,
            flexDirection: "column",
            alignItems: "center",
            gap: 15,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 40,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View style={{}}>
              <Image source={require("../assets/icon/wallet.png")} />
            </View>
            <View style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  color: theme.appPrimary,
                  marginTop: 10,
                }}
              >
                EX-Tracker
              </Text>
            </View>
          </View>
          <View style={{ height: 300, width: "auto" }}>
            {/* <Image source={require('../assets/icon/preview1.png')}/> */}
            {/* <Preview width={400} height={500}/> */}
            <LottieView
              source={require("../assets/lottie/Money Spawns.json")} // path to your .lottie file
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 20,
              justifyContent: "center",
              alignItems: "center",
              width: 400,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: theme.textPrimary,
                textAlign:"center"
              }}
            >
              Simple Money Management
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                textAlign: "center",
                color: theme.textPrimary,
              }}
            >
             Get your notifications or alert when you do the over expenses
            </Text>
          </View>
          <View style={{ padding: 16, flex: 1, width: "100%", marginTop: 30 }}>
            <Button title="Continue" onPress={goToNextPage} />
          </View>
        </View>
        <View
          style={{
            width: SCREEN_WIDTH,
            flexDirection: "column",
            alignItems: "center",
            gap: 15,
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 40,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <View style={{}}>
              <Image source={require("../assets/icon/wallet.png")} />
            </View>
            <View style={{ display: "flex" }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  color: theme.appPrimary,
                  marginTop: 10,
                }}
              >
                EX-Tracker
              </Text>
            </View>
          </View>
          <View style={{ height: 300, width: "auto" }}>
            {/* <Image source={require('../assets/icon/preview1.png')}/> */}
            {/* <Preview width={400} height={500}/> */}
            <LottieView
              source={require("../assets/lottie/Money tree.json")} // path to your .lottie file
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
          <View
            style={{
              flexDirection: "column",
              gap: 20,
              justifyContent: "center",
              alignItems: "center",
              width: 300,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 600,
                color:theme.textPrimary,
              }}
            >
             Easy to Track and Analize
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                textAlign: "center",
                color: theme.textPrimary,
              }}
            >
              Tracking your expense help make sure you don't overspend
            </Text>
          </View>
          <View style={{ padding: 16, flex: 1, width: "100%", marginTop: 30 }}>
            <Button title="Continue"  onPress={()=>router.push('/screen/login_page')}/>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;
