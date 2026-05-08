import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  photoUri: string | null;
  onPhoto: (uri: string) => void;
};

export default function PhotoCapture({ photoUri, onPhoto }: Props) {
  async function handleCapture() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Camera permission needed', 'Please allow camera access in settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onPhoto(result.assets[0].uri);
    }
  }

  async function handlePick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Gallery permission needed', 'Please allow photo library access in settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onPhoto(result.assets[0].uri);
    }
  }

  function handlePress() {
    Alert.alert('Add a photo', 'Choose how to add your daily photo', [
      { text: 'Take photo', onPress: handleCapture },
      { text: 'Choose from library', onPress: handlePick },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>add today's photo</Text>
          <Text style={styles.placeholderSub}>required for each entry</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#e8d5c4',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: 220,
  },
  placeholder: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdf6ee',
    gap: 6,
  },
  placeholderIcon: {
    fontSize: 32,
  },
  placeholderText: {
    fontSize: 15,
    color: '#4a3728',
    fontWeight: '600',
  },
  placeholderSub: {
    fontSize: 12,
    color: '#a89b8c',
  },
});