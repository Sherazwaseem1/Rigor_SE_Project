import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Trip, Trucker, getAllTruckers, createTrip, getTruckByTruckerId, updateTruckerStatus } from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store"; // Import RootState from your store
import { router } from 'expo-router'
import IconSymbol from "react-native-vector-icons/FontAwesome"; // Make sure you import the icon library you're using.
import { useIsFocused } from "@react-navigation/native";


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const TripAssignmentScreen: React.FC = () => {
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [selectedTruckerId, setSelectedTruckerId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Trip>>({
    truck_id: 0,
    start_location: "",
    end_location: "",
    start_time: new Date().toISOString(),
    status: "Scheduled",
    distance: 0,
    assigned_by_admin_id: 0,
  });
  const user = useSelector((state: RootState) => state.user);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const truckerData = await getAllTruckers();
        const activeTruckers = truckerData.filter(t => t.status === "Inactive");
        setTruckers(activeTruckers);
      } catch (error) {
        console.error("Error fetching truckers", error);
        Alert.alert("Error", "Could not load truckers.");
      }
    };
    fetchTruckers();
  }, [isFocused]);

  const handleInputChange = (key: keyof Trip, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTruckerId) {
      Alert.alert("Missing Info", "Please select trucker.");
      return;
    }

        // Clear the input fields after successful trip creation


    try {
      const truck = await getTruckByTruckerId(selectedTruckerId);

      const newTrip = {
        ...form,
        truck_id: truck.truck_id,
        trucker_id: selectedTruckerId,
        assigned_by_admin_id: user.id, // Use the admin ID from Redux state
        end_time: undefined,
        trip_rating: 0,
      } as Omit<Trip, "trip_id">;

      await createTrip(newTrip);
      await updateTruckerStatus(selectedTruckerId, "Active");
      Alert.alert("Success", "Trip assigned successfully!");

      handleClear()
      
      router.push('/AdminDashboardNew');

    } catch (error) {
      console.error("Trip creation error:", error);
      Alert.alert("Unable to Process your request", "Selected trucker does not have a truck");
    }
  };

    // Function to clear the form inputs on the screen
    const handleClear = () => {
      setForm({
        truck_id: 0,
        start_location: "",
        end_location: "",
        start_time: new Date().toISOString(),
        status: "Scheduled",
        distance: 0,
        assigned_by_admin_id: 0,
      });
    
      setSelectedTruckerId(null); // Clear the selected trucker picker
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
              router.push('/AdminDashboardNew');
          }}
        >
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron-left" color="#333" />
            <Text style={styles.backButtonLabel}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/rigor_no_bg.jpeg")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { marginBottom: 32 }]}>Assign New Trip</Text>

        <View style={[styles.inputContainer, { marginTop: 16 }]}>
          <Text style={styles.label}>Select InActive Trucker</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedTruckerId}
              onValueChange={(itemValue) => setSelectedTruckerId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Trucker --" value={null} />
              {truckers.map((trucker) => (
                <Picker.Item
                  key={trucker.trucker_id}
                  label={`${trucker.name} (${trucker.trucker_id})`}
                  value={trucker.trucker_id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Start Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start location"
            placeholderTextColor="#666"
            value={form.start_location}
            onChangeText={(text) => handleInputChange("start_location", text)}
          />

          <Text style={styles.label}>End Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter end location"
            placeholderTextColor="#666"
            value={form.end_location}
            onChangeText={(text) => handleInputChange("end_location", text)}
          />

          <Text style={styles.label}>Start Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter start time"
            placeholderTextColor="#666"
            value={form.start_time}
            onChangeText={(text) => handleInputChange("start_time", text)}
          />

          <Text style={styles.label}>Distance (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter distance"
            placeholderTextColor="#666"
            value={form.distance ? form.distance.toString() : ""}
            keyboardType="numeric"
            onChangeText={(text) => handleInputChange("distance", parseFloat(text) || 0)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Assign Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: "#FF3B30" }]}
          onPress={handleClear}
        >
          <Text style={styles.submitButtonText}>Clear Form</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: Math.max(screenHeight * 0.03, 24),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
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
    marginLeft: 5,
  },
  container: {
    flexGrow: 1,
    padding: Math.max(screenWidth * 0.04, 16),
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    height: Math.max(screenHeight * 0.1, 80), // Adjusted logo container height
  },
  logo: {
    width: "60%",
    height: "100%",
  },
  title: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 18), 22),
    fontWeight: "600",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    textAlign: "center",
    color: "#202545",
    letterSpacing: 0.5,
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
    marginBottom: Math.max(screenHeight * 0.01, 8),
    color: "#202545",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: Math.max(screenWidth * 0.03, 12),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    width: "100%",
    backgroundColor: "#fff",
    fontSize: Math.min(Math.max(screenWidth * 0.04, 14), 16),
    color: "#202545",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    height: Math.max(screenHeight * 0.06, 40),
  },
  picker: {
    height: Math.max(screenHeight * 0.06, 40),
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#088395",
    padding: Math.max(screenHeight * 0.015, 12),
    borderRadius: 8,
    alignItems: "center",
    marginBottom: Math.max(screenHeight * 0.02, 16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonText: {
    color: "white",
    fontSize: Math.min(Math.max(screenWidth * 0.04, 14), 16),
    fontWeight: "600",
  },
});

export default TripAssignmentScreen;
