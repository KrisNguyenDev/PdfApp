import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-primary">
      {/* <Text className="font-bold text-5xl text-center">Welcome!</Text>
      <Link
        className="mt-10 underline text-blue-500"
        href={{
          pathname: "/movies/[id]",
          params: { id: "1" },
        }}
      >
        Avengers movie
      </Link> */}
      <View className="bg-yellow-300 h-full w-full"></View>
    </SafeAreaView>
  );
}
