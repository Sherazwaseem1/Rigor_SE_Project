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
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { createReimbursement } from "../../services/api";
import { router } from "expo-router"; 

const ReimbursementFormScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [form, setForm] = useState({
    trip_id: 1001,
    amount: 0,
    receipt_url: "",
    status: "Pending",
    comments: "",
    admin_id: user.id,
  });

  const handleInputChange = (key: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { trip_id, amount, status, comments, admin_id, receipt_url } = form;

    if (!amount) {
      Alert.alert("Missing Info", "Please fill the required fields.");
      return;
    }

    const reimbursementData = {
      trip_id,
      amount: { $numberDecimal: amount.toString() }, // MongoDB Decimal128 format
      receipt_url, // Can be empty string for now
      status,
      comments,
      admin_id,
    };

    try {
      const response = await createReimbursement(reimbursementData);
      Alert.alert("Success", "Reimbursement request submitted successfully!");
      router.push("/TruckerDashboard"); 
    } catch (error) {
      console.error("Error submitting reimbursement:", error);
      Alert.alert("Error", "Failed to submit reimbursement.");
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
          onChangeText={(text) => handleInputChange("amount", parseFloat(text))}
        />

        <Text style={styles.label}>Comments (Optional):</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          onChangeText={(text) => handleInputChange("comments", text)}
        />

        {/* Removed the image upload section */}

        <View style={styles.buttonContainer}>
          <Button title="Submit Reimbursement" onPress={handleSubmit} color="#007AFF" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    marginTop: 30,
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    marginTop: 15,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default ReimbursementFormScreen;
