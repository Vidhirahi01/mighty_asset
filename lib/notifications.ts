import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
        shouldShowBanner: true,  
        shouldShowList: true,  
        shouldPlaySound: true,
        shouldSetBadge: false,
  }),
});

export function handleForegroundNotification() {
  return Notifications.addNotificationReceivedListener(notification => {
    const { title, body, data } = notification.request.content;
    console.log('Notification received in foreground:', { title, body, data });
  });
}
export function handleNotificationTap() {
  return Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    if(!data) return;
    switch (data.type) {
      case 'new_asset':
        router.push({
            pathname: '/(operation)/assets',
            params: {id: data.assetId},
        });
        break;
      case 'new_message':
        router.push(`/messages/${data.messageId}` as any);
        break;
      default:
        router.push('/notifications');
    }
  });
}