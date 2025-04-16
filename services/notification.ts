import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Get push token
async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'web') {
        return null;
    }

    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        // Get the token with the project ID
        token = (await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId
        })).data;

        // Configure for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Unregister from notifications
export const unregisterForNotificationsAsync = async () => {
    try {
        if (Platform.OS === 'web') return;

        // Remove all notification listeners
        await Notifications.removeAllNotificationListeners();

        // Cancel all scheduled notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        return true;
    } catch (error) {
        console.error('Error unregistering notifications:', error);
        return false;
    }
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
    try {
        if (Platform.OS === 'web') return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
    }
};

// Send notification to trucker about assigned trip
export const sendTripAssignmentNotification = async (truckerName: string, tripDetails: {
    start_location: string;
    end_location: string;
    start_time: string;
}) => {
    try {
        const permissionGranted = await requestNotificationPermissions();
        if (!permissionGranted) {
            console.log('Notification permissions not granted');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🚚 New Trip Assignment',
                body: `Hello ${truckerName}! You have been assigned a new trip:\n📍 From: ${tripDetails.start_location}\n🏁 To: ${tripDetails.end_location}\n🕒 Start: ${new Date(tripDetails.start_time).toLocaleString()}`,
                data: { tripDetails },
                sound: 'default',
                priority: 'high',
            },
            trigger: null, // Send immediately
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        throw new Error('Failed to send notification');
    }
};