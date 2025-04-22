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
import { createTruck, getTruckersWithoutTruck, Trucker  } from "../../services/api"; // Adjust the path if needed
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useState } from 'react';



const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface TruckFormData {
  license_plate: string;
  chassis_number: string;
  capacity: string;
  assigned_trucker_id?: string;
}

export default function TruckForm() {

  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [selectedTruckerId, setSelectedTruckerId] = useState<string | undefined>(undefined);

  
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

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const data = await getTruckersWithoutTruck();
        setTruckers(data);
      } catch (error) {
        console.error("Failed to fetch truckers:", error);
      }
    };
  
    if (isFocused) fetchTruckers();
  }, [isFocused]);
  

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
      router.push("/AdminDashboardNew"); 
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

        <Text style={[styles.label, { color: "#202545" }]}>Assign Trucker</Text>
        <View style={[styles.input, { padding: 0 }]}>
          <Picker
            selectedValue={selectedTruckerId}
            onValueChange={(itemValue) => {
              setSelectedTruckerId(itemValue);
              setValue("assigned_trucker_id", itemValue);
            }}
          >
            <Picker.Item label="-- Select a trucker --" value={undefined} />
            {truckers.map((trucker) => (
              <Picker.Item
                key={trucker.trucker_id}
                label={`${trucker.name} - ${trucker.trucker_id}`}
                value={trucker.trucker_id.toString()}
              />
            ))}
          </Picker>
        </View>

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
    marginBottom: Math.max(screenHeight * 0.04, 32),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    height: Math.max(screenHeight * 0.2, 160),
  },
  logo: {
    width: Math.min(Math.max(screenWidth * 0.35, 140), 200),
    height: Math.min(Math.max(screenWidth * 0.35, 140), 200),
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
    color: "#071952",
    letterSpacing: 0.5,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#088395",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "100%",
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#071952",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: "#088395",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#088395",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
