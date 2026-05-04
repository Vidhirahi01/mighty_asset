import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
const projectId = Constants.expoConfig?.extra?.eas?.projectId
  ?? Constants.easConfig?.projectId;
export async function getPushToken() {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;


  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });

  return tokenData.data;
}