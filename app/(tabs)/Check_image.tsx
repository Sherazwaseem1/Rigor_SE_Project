import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function ImagePickerComponent() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dx7hrymxn/image/upload';
  const UPLOAD_PRESET = 'Rigor-code';

  const pickImageFromGallery = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setUploading(true);
      const uploadedUrl = await uploadToCloudinary(uri);
      setUploading(false);

      if (uploadedUrl) setImageUri(uploadedUrl);
    }
  };

  const uploadToCloudinary = async (photoUri: string): Promise<string | null> => {
    const data = new FormData();

    data.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    } as any);
    data.append('upload_preset', UPLOAD_PRESET);
    data.append('cloud_name', 'YOUR_CLOUD_NAME');

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      console.log('Cloudinary Response:', json);

      if (json.secure_url) {
        return json.secure_url;
      } else {
        Alert.alert('Upload Failed', 'No secure_url in response');
        return null;
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      Alert.alert('Upload Failed', 'Something went wrong during upload');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Image" onPress={pickImageFromGallery} />
      {uploading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});
