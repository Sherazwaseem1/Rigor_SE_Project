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
import { createReimbursement, Reimbursement } from "../../services/api";
import { router } from "expo-router";

const ReimbursementFormScreen: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [form, setForm] = useState({
    trip_id: 1001,
    amount: 0,
    receipt_url: "https://example.com/receipt.pdf",
    status: "Pending",
    comments: "",
    admin_id: user.id,
  });

  const handleInputChange = (key: keyof typeof form, value: any) => {
    if (key === "amount") {
      // Convert value to number for the amount field
      value = parseFloat(value) || 0; 
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const { trip_id, amount, status, comments, admin_id, receipt_url } = form;

    // Check if amount is valid
    if (amount <= 0) {
      Alert.alert("Missing Info", "Please enter a valid amount.");
      return;
    }

    // Format amount for MongoDB Decimal128
    const reimbursementData: Reimbursement = {
      reimbursement_id: 1,
      trip_id,
      amount: { $numberDecimal: amount.toString() }, 
      receipt_url, // Can be empty string for now
      status,
      comments,
      admin_id,
    };

    console.log("Submitting reimbursement:", reimbursementData); // Log the data before sending t

    try {
      const response = await createReimbursement(reimbursementData);
      Alert.alert("Success", "Reimbursement request submitted successfully!");
      router.push("/TruckerDashboardNew");
    } catch (error: any) {
      console.error("Error submitting reimbursement:", error);
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
          value={form.amount.toString()} // Convert to string only for display
          onChangeText={(text) => handleInputChange("amount", text)} // Keep input as string, convert in function
        />

        <Text style={styles.label}>Comments (Optional):</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={form.comments}
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
