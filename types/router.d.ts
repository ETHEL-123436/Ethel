/* Custom route type declarations for the app */
import 'expo-router';

declare module 'expo-router' {
  interface RelativePathString {
    '/(settings)/kyc-upload': true;
    '/(settings)/theme-selection': true;
    '/(settings)/language-selection': true;
    '/(settings)/notifications': true;
    '/(settings)/privacy': true;
    '/(settings)/become-driver': true;
    '/(settings)/help': true;
    '/(settings)/driver-settings': true;
    '/(settings)/profile': true;
    '/(admin)/dashboard-clean': true;
    '/(admin)/admin-settings': true;
    // Add other routes as needed
  }
}
