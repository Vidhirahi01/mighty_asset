import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function getPushToken() {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return tokenData.data;
}