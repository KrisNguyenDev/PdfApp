import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="h-full">
      <Text className="font-bold text-5xl text-center">Welcome!</Text>
      <Link
        className="mt-10 underline text-blue-500"
        href={{
          pathname: "/movies/[id]",
          params: { id: "1" },
        }}
      >
        Avengers movie
      </Link>
    </View>
  );
}
