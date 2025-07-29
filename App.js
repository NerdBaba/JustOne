import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

import MainScreen from './src/screens/MainScreen';
import InputScreen from './src/screens/InputScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

const logoXml = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="48" fill="#f7f1ed" stroke="#151513" stroke-width="4"/>
<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Lora-Regular" font-size="50" fill="#151513">1</text>
</svg>
`;

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Lora-Regular': require('./assets/fonts/Lora-Regular.ttf'),
          'Lora-Italic': require('./assets/fonts/Lora-Italic.ttf'),
          'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f7f1ed',
              shadowOpacity: 0,
              elevation: 0,
            },
            headerTintColor: '#151513',
            headerTitleStyle: {
              fontFamily: 'OpenSans-Regular',
            },
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={({ navigation }) => ({
              headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                  <SvgXml xml={logoXml} width="30" height="30" />
                  <Text style={styles.headerTitleText}>JustOne</Text>
                </View>
              ),
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="settings-outline" size={24} color="#151513" />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Input"
            component={InputScreen}
            options={{ title: 'Add Your One Thing' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontFamily: 'Lora-Italic',
    fontSize: 22,
    marginLeft: 10,
    color: '#151513',
  },
});