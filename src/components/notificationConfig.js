import PushNotification from 'react-native-push-notification';

export const configureNotifications = () => {
  PushNotification.createChannel(
    {
      channelId: 'default-channel-id', // Give it an id to reference it later
      channelName: 'Default Channel',
      channelDescription: 'A default notification channel',
      soundName: 'alarm.mp3', // Make sure this sound file exists in the 'android/app/src/main/res/raw' directory
      playSound: true,
      vibrate: true,
    },
    created =>
      console.log(`createChannel 'default-channel-id' returned '${created}'`),
  );
};

export const showNotification = () => {
  PushNotification.localNotification({
    channelId: 'default-channel-id', // Set the channel id
    title: 'Destination Alert',
    message: 'You are less than 1 km away from the target location!',
  });
};
