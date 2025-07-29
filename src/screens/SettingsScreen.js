import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = ({ navigation }) => {
  const [devMode, setDevMode] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(true);
  const [allowImageEditing, setAllowImageEditing] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedDevMode = await AsyncStorage.getItem('devMode');
      if (storedDevMode !== null) {
        setDevMode(JSON.parse(storedDevMode));
      }
      const storedShowDeleteButtons = await AsyncStorage.getItem('showDeleteButtons');
      if (storedShowDeleteButtons !== null) {
        setShowDeleteButtons(JSON.parse(storedShowDeleteButtons));
      }
      const storedAllowImageEditing = await AsyncStorage.getItem('allowImageEditing');
      if (storedAllowImageEditing !== null) {
        setAllowImageEditing(JSON.parse(storedAllowImageEditing));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleDevMode = async () => {
    try {
      const newDevMode = !devMode;
      setDevMode(newDevMode);
      await AsyncStorage.setItem('devMode', JSON.stringify(newDevMode));
    } catch (error) {
      console.error('Error toggling dev mode:', error);
    }
  };

  const toggleShowDeleteButtons = async () => {
    try {
      const newShowDeleteButtons = !showDeleteButtons;
      setShowDeleteButtons(newShowDeleteButtons);
      await AsyncStorage.setItem('showDeleteButtons', JSON.stringify(newShowDeleteButtons));
    } catch (error) {
      console.error('Error toggling delete buttons:', error);
    }
  };

  const toggleAllowImageEditing = async () => {
    try {
      const newAllowImageEditing = !allowImageEditing;
      setAllowImageEditing(newAllowImageEditing);
      await AsyncStorage.setItem('allowImageEditing', JSON.stringify(newAllowImageEditing));
    } catch (error) {
      console.error('Error toggling image editing:', error);
    }
  };

  const resetAllData = async () => {
    Alert.alert(
      'Reset All Data',
      'Are you sure you want to delete all your entries? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('entries');
              Alert.alert('Success', 'All entries have been deleted.');
              // Navigate back to MainScreen and ensure it reloads
              navigation.navigate('Main');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to delete entries.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Developer Mode</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#1fabe7' }}
          thumbColor={devMode ? '#f6b39c' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleDevMode}
          value={devMode}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Show Delete Buttons</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#1fabe7' }}
          thumbColor={showDeleteButtons ? '#f6b39c' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleShowDeleteButtons}
          value={showDeleteButtons}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Allow Image Cropping</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#1fabe7' }}
          thumbColor={allowImageEditing ? '#f6b39c' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleAllowImageEditing}
          value={allowImageEditing}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={resetAllData}>
        <Text style={styles.buttonText}>Reset All Entries</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1ed',
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f6b39c',
  },
  settingText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 18,
    color: '#151513',
  },
  button: {
    backgroundColor: '#f6b39c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'OpenSans-Regular',
    color: '#151513',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;