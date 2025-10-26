import React, { useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import themeConfig from "./utils/color";
import isDark from "./utils/isDark";
import LottieView from "lottie-react-native";
import Button from "@/component/button";
import { Dimensions } from "react-native";
import {  useRouter } from "expo-router";
const profile = () => {
  const router = useRouter()
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const goToNextPage = () => {
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
  // const un_color = isDark()?themeConfig.primaryL : themeConfig.primaryD
  return (
    <SafeAreaView
      style={{
        backgroundColor: isDark() ? themeConfig.primaryD : themeConfig.primaryL,
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
                  color: themeConfig.appPrimary,
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
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
              }}
            >
              Note Down Expenses
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                textAlign: "center",
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
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
                  color: themeConfig.appPrimary,
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
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
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
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
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
                  color: themeConfig.appPrimary,
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
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
              }}
            >
             Easy to Track and Analize
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: 500,
                textAlign: "center",
                color: isDark() ? themeConfig.primaryL : themeConfig.primaryD,
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
