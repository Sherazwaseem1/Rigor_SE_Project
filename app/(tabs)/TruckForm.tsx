import React, { useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "../../hooks/useThemeColor";
import { createTruck } from "../../services/api"; // Adjust the path if needed
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface TruckFormData {
  license_plate: string;
  chassis_number: string;
  capacity: string;
  assigned_trucker_id?: string;
}

export default function TruckForm() {
  const backgroundColor = useThemeColor(
    { light: "#fff", dark: "#fff" },
    "background"
  );
  const textColor = useThemeColor({ light: "#000", dark: "#000" }, "text");

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TruckFormData>();

  const isFocused = useIsFocused();

  const onSubmit = async (data: TruckFormData) => {
    const capacityValue = Number(data.capacity);

    if (isNaN(capacityValue) || capacityValue <= 0) {
      alert("Capacity must be a number greater than 0");
      return;
    }

    const submissionData = {
      license_plate: data.license_plate,
      chassis_number: data.chassis_number,
      capacity: capacityValue,
      ...(data.assigned_trucker_id
        ? { assigned_trucker_id: parseInt(data.assigned_trucker_id) }
        : {}),
    };

    console.log("Form data to submit:", submissionData);

    try {
      const response = await createTruck(submissionData);
      alert("Truck created successfully!");
      router.push("/AdminDashboardNew"); // Navigate to AdminDashboardNew after successful submission
    } catch (error) {
      alert("Failed to create truck. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
                router.push('/AdminDashboardNew');
            }}
          >
            <View style={styles.backButtonContent}>
              <IconSymbol size={24} name="chevron.left" color="#333" />
              <Text style={styles.backButtonLabel}>Back</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/rigor_no_bg.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: "#202545" }]}>Add New Truck</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: "#202545" }]}>
            License Plate
          </Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Enter license plate"
            placeholderTextColor="#666"
            onChangeText={(text) =>
              setValue("license_plate", text, { shouldValidate: true })
            }
          />
          {errors.license_plate && (
            <Text style={styles.errorText}>License plate is required</Text>
          )}

          <Text style={[styles.label, { color: "#202545" }]}>
            Chassis Number
          </Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Enter chassis number"
            placeholderTextColor="#666"
            onChangeText={(text) =>
              setValue("chassis_number", text, { shouldValidate: true })
            }
          />
          {errors.chassis_number && (
            <Text style={styles.errorText}>Chassis number is required</Text>
          )}

          <Text style={[styles.label, { color: "#202545" }]}>
            Capacity (kg)
          </Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            keyboardType="numeric"
            placeholder="Enter capacity"
            placeholderTextColor="#666"
            onChangeText={(text) =>
              setValue("capacity", text, { shouldValidate: true })
            }
          />
          {errors.capacity && (
            <Text style={styles.errorText}>
              Capacity is required and must be greater than 0
            </Text>
          )}

          <Text style={[styles.label, { color: "#202545" }]}>
            Assigned Trucker ID
          </Text>
          <TextInput
            style={[styles.input, { color: textColor }]}
            keyboardType="numeric"
            placeholder="Enter assigned trucker ID"
            placeholderTextColor="#666"
            onChangeText={(text) => setValue("assigned_trucker_id", text)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Math.max(screenHeight * 0.03, 24),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  header: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
  },
  backButton: {
    paddingVertical: Math.max(screenHeight * 0.01, 8),
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonLabel: {
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    color: "#333",
    marginBottom: screenHeight * 0.004,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  logo: {
    width: Math.min(Math.max(screenWidth * 0.25, 100), 140),
    height: Math.min(Math.max(screenWidth * 0.25, 100), 140),
    resizeMode: "contain",
  },
  title: {
    fontSize: Math.min(Math.max(screenWidth * 0.06, 20), 24),
    fontWeight: "bold",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    textAlign: "center",
    color: "#202545",
  },
  inputContainer: {
    flex: 1,
    marginBottom: Math.max(screenHeight * 0.02, 16),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.038, 14), 16),
    marginBottom: Math.max(screenHeight * 0.008, 6),
    color: "#202545",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
    padding: Math.max(screenWidth * 0.025, 10),
    marginBottom: Math.max(screenHeight * 0.012, 10),
    fontSize: Math.min(Math.max(screenWidth * 0.038, 14), 16),
    width: "100%",
  },
  errorText: {
    color: "#ff0000",
    fontSize: Math.min(Math.max(screenWidth * 0.035, 12), 14),
    marginBottom: Math.max(screenHeight * 0.01, 8),
  },
  submitButton: {
    backgroundColor: "#7F9FB4",
    paddingVertical: Math.max(screenHeight * 0.012, 10),
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
    alignItems: "center",
    marginTop: Math.max(screenHeight * 0.02, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    marginHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  submitButtonText: {
    color: "#202545",
    fontSize: Math.min(Math.max(screenWidth * 0.045, 16), 18),
    fontWeight: "bold",
  },
});
