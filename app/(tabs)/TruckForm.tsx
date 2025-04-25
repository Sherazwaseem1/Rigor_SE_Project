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
import { SafeAreaView } from 'react-native-safe-area-context';
import { createTruck, getTruckersWithoutTruck, Trucker  } from "../../services/api"; 
import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useState } from 'react';
import styles from '../../assets/styles/styleTruckForm';

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


    try {
      const response = await createTruck(submissionData);
      alert("Truck created successfully!");
      router.push("/AdminDashboardNew"); 
    } catch (error) {
      alert("Failed to create truck. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
                router.push('/AdminDashboardNew');
            }}
          >
            <View style={styles.backButtonContent}>
              <IconSymbol size={20} name="chevron.left" color="#202545" />
              <Text style={[styles.backButtonLabel, { color: '#202545' }]}>Back</Text>
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
            <Picker.Item label="Select a trucker" value={undefined} />
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
    </SafeAreaView>
  );
}