import { View,Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from '@/components/LoginPage';
import MainScreen from '@/components/MainScreen';
const Stack = createStackNavigator();


export default function RootLayout() {
  return (
     <Stack.Navigator initialRouteName='LoginScreen' screenOptions={{ headerShown: false }} >
      <Stack.Screen name="LoginScreen" component={LoginPage} />
      <Stack.Screen name="MainScreen" component={MainScreen} />
    </Stack.Navigator>
  );
}
