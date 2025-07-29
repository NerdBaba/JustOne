import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  UIManager,
  LayoutAnimation,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const logoXml = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="50" cy="50" r="48" fill="#f7f1ed" stroke="#151513" stroke-width="4"/>
<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Lora-Regular" font-size="50" fill="#151513">1</text>
</svg>
`;

const MainScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [canAddEntry, setCanAddEntry] = useState(true);
  const [devMode, setDevMode] = useState(false);
  const [showDeleteButtons, setShowDeleteButtons] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadEntries();
      loadSettings();
    }
  }, [isFocused]);

  const loadSettings = async () => {
    try {
      const storedDevMode = await AsyncStorage.getItem('devMode');
      const parsedDevMode = storedDevMode !== null ? JSON.parse(storedDevMode) : false;
      setDevMode(parsedDevMode);

      const storedShowDeleteButtons = await AsyncStorage.getItem('showDeleteButtons');
      if (storedShowDeleteButtons !== null) {
        setShowDeleteButtons(JSON.parse(storedShowDeleteButtons));
      }

      // Update canAddEntry based on devMode after loading settings
      if (parsedDevMode) {
        setCanAddEntry(true);
      } else {
        // Re-check daily entry if devMode is off
        const storedEntries = await AsyncStorage.getItem('entries');
        const parsedEntries = storedEntries ? JSON.parse(storedEntries) : [];
        checkIfEntryExistsForToday(parsedEntries);
      }

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('entries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries).sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setEntries(parsedEntries);
      } else {
        setEntries([]); // Explicitly set to empty if no entries found
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const checkIfEntryExistsForToday = (entries) => {
    const today = new Date().toLocaleDateString();
    const entryExists = entries.some(
      (entry) => new Date(entry.date).toLocaleDateString() === today
    );
    setCanAddEntry(!entryExists);
  };

  const deleteEntry = async (dateToDelete) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const updatedEntries = entries.filter(
                (entry) => entry.date !== dateToDelete
              );
              await AsyncStorage.setItem(
                'entries',
                JSON.stringify(updatedEntries)
              );
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              setEntries(updatedEntries);
              // Re-check daily entry if devMode is off after deletion
              if (!devMode) {
                checkIfEntryExistsForToday(updatedEntries);
              }
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Failed to delete entry.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.entry}>
      {showDeleteButtons && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteEntry(item.date)}
        >
          <Ionicons name="close-circle" size={24} color="#151513" />
        </TouchableOpacity>
      )}
      <Text style={styles.entryDate}>
        {new Date(item.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      {item.uri && (
        <Image source={{ uri: item.uri }} style={styles.entryImage} />
      )}
      {item.text.trim() !== '' && (
        <Text style={styles.entryText}>{item.text}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SvgXml xml={logoXml} width="100" height="100" style={styles.emptyLogo} />
          <Text style={styles.emptyText}>
            One thought. One day. One you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity
        style={[styles.addButton, !canAddEntry && styles.disabledButton]}
        onPress={() => navigation.navigate('Input')}
        disabled={!canAddEntry}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f1ed',
  },
  list: {
    padding: 20,
  },
  entry: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f6b39c',
  },
  entryDate: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  entryText: {
    fontFamily: 'Lora-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: '#151513',
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1fabe7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 32,
    marginTop: Platform.OS === 'android' ? -2 : 0, // Font alignment fix
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Lora-Regular',
    fontSize: 20,
    textAlign: 'center',
    color: '#151513',
    lineHeight: 32,
    marginTop: 20,
  },
  emptyLogo: {
    marginBottom: 20,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f6b39c',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default MainScreen;