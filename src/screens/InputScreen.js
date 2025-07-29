
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

const InputScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [devMode, setDevMode] = useState(false);
  const [allowImageEditing, setAllowImageEditing] = useState(true);

  useEffect(() => {
    loadSettings();
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const loadSettings = async () => {
    try {
      const storedDevMode = await AsyncStorage.getItem('devMode');
      if (storedDevMode !== null) {
        setDevMode(JSON.parse(storedDevMode));
      }
      const storedAllowImageEditing = await AsyncStorage.getItem('allowImageEditing');
      if (storedAllowImageEditing !== null) {
        setAllowImageEditing(JSON.parse(storedAllowImageEditing));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: allowImageEditing,
      aspect: allowImageEditing ? [4, 3] : undefined,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveEntry = async () => {
    if (text.trim() === '' && !image) {
      Alert.alert('Empty Entry', 'Please write something or select an image.');
      return;
    }

    try {
      const newEntry = {
        date: new Date().toISOString(),
        type: image && text.trim() !== '' ? 'imageAndText' : image ? 'image' : 'text',
        text: text,
        uri: image,
      };
      const storedEntries = await AsyncStorage.getItem('entries');
      const entries = storedEntries ? JSON.parse(storedEntries) : [];

      if (!devMode) {
        const today = new Date().toLocaleDateString();
        const entryExists = entries.some(
          (entry) => new Date(entry.date).toLocaleDateString() === today
        );
        if (entryExists) {
          Alert.alert('Entry Exists', 'You can only add one entry per day. Disable Developer Mode in settings to add more.');
          return;
        }
      }

      entries.push(newEntry);
      await AsyncStorage.setItem('entries', JSON.stringify(entries));
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save your entry. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TextInput
          style={styles.input}
          placeholder="What is your one thing for today?"
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
          multiline
        />
        {image && (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>Choose Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1ed',
    padding: 20,
  },
  input: {
    flex: 1,
    fontFamily: 'Lora-Regular',
    fontSize: 22,
    lineHeight: 34,
    color: '#151513',
    textAlignVertical: 'top',
    paddingTop: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: '#f6b39c',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  imageButtonText: {
    fontFamily: 'OpenSans-Regular',
    color: '#151513',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1fabe7',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  saveButtonText: {
    fontFamily: 'OpenSans-Regular',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InputScreen;
