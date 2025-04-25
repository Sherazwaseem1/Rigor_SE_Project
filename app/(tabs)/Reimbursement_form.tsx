import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { createReimbursement} from "../../services/api";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import styles from '../../assets/styles/styleReimbursementForm';

import { Reimbursement } from "../../services/util";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dx7hrymxn/image/upload";
const UPLOAD_PRESET = "Rigor-code";

const ReimbursementFormScreen: React.FC = () =>
{
  const user = useSelector((state: RootState) => state.user);
  const [uploading, setUploading] = useState(false);
  const { trip_id } = useLocalSearchParams();
  const numericTripId =
    typeof trip_id === "string" ? parseInt(trip_id) :
    Array.isArray(trip_id) ? parseInt(trip_id[0]) :
    0; 
    
  const [form, setForm] = useState({
    trip_id: numericTripId,
    amount: 0,
    receipt_url: "",
    status: "Pending",
    comments: "",
    admin_id: user.id,
  });

  const handleInputChange = (key: keyof typeof form, value: any) => {
    if (key === "amount") {
      value = parseFloat(value) || 0;
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload receipts.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setUploading(true);
      const uploadedUrl = await uploadToCloudinary(uri);
      setUploading(false);

      if (uploadedUrl) {
        setForm((prev) => ({ ...prev, receipt_url: uploadedUrl }));
      }
    }
  };

  const uploadToCloudinary = async (photoUri: string): Promise<string | null> => {
    const data = new FormData();
    data.append("file", {
      uri: photoUri,
      type: "image/jpeg",
      name: `upload_${Date.now()}.jpg`,
    } as any);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", "dx7hrymxn");

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (json.secure_url) return json.secure_url;

      Alert.alert("Upload Failed", "No secure_url in Cloudinary response");
      return null;
    } catch (error) {
      Alert.alert("Upload Failed", "Something went wrong during upload");
      return null;
    }
  };

  const handleSubmit = async () => {
    const { trip_id, amount, status, comments, admin_id, receipt_url } = form;
    

    if (amount <= 0) {
      Alert.alert("Missing Info", "Please enter a valid amount.");
      return;
    }

    if (!receipt_url) {
      Alert.alert("Missing Receipt", "Please upload a receipt image.");
      return;
    }

    const reimbursementData: Reimbursement = {
      reimbursement_id: 1,
      trip_id,
      amount: { $numberDecimal: amount.toString() },
      receipt_url,
      status,
      comments,
      admin_id,
    };

    try {
      const response = await createReimbursement(reimbursementData);
      Alert.alert("Success", "Reimbursement request submitted successfully!");
      router.push("/TruckerDashboardNew");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || "Failed to submit reimbursement.";
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Submit Reimbursement</Text>

        <Text style={styles.label}>Amount (in PKR):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.amount.toString()}
          onChangeText={(text) => handleInputChange("amount", text)}
        />

        <Text style={styles.label}>Comments (Optional):</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={form.comments}
          onChangeText={(text) => handleInputChange("comments", text)}
        />

        <View style={{ marginTop: 20 }}>
          <Button title="Upload Receipt Image" onPress={pickImageFromGallery} color="#007AFF" />
        </View>

        {uploading && (
          <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
        )}

        {form.receipt_url !== "" && (
          <Image
            source={{ uri: form.receipt_url }}
            style={styles.image}
            resizeMode="contain"
          />
        )}

        <View style={styles.buttonContainer}>
          <Button title="Submit Reimbursement" onPress={handleSubmit} color="#007AFF" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default ReimbursementFormScreen;
