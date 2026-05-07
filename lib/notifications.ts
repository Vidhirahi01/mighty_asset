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
    if (!data) return;
    const assetId = (typeof data.assetId === 'string' || typeof data.assetId === 'number')
      ? data.assetId
      : undefined;
    switch (data.type) {
      case 'new_asset':
        router.push({
          pathname: '/(operation)/assets',
          params: assetId ? { id: assetId } : undefined,
        });
        break;
      case 'asset_created':
      case 'asset_updated':
      case 'asset_deleted':
        router.push({
          pathname: '/(operation)/assets',
          params: assetId ? { id: assetId } : undefined,
        });
        break;
      case 'asset_assigned':
        router.push('/(employee)/myassets');
        break;
      case 'repair_assigned':
        router.push('/(technician)/dashboard');
        break;
      case 'repair_done':
        router.push('/(manager)/dashboard');
        break;
      case 'return_requested':
        router.push('/(operation)/dashboard');
        break;
      case 'request_created':
        router.push('/(manager)/approvals');
        break;
      case 'request_approved':
      case 'request_rejected':
        router.push('/(employee)/dashboard');
        break;
      case 'new_message':
        router.push(`/messages/${data.messageId}` as any);
        break;
      default:
        router.push('/');
    }
  });
}