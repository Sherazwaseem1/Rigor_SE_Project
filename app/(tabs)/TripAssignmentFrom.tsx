import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Dimensions
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Trip, Trucker, getAllTruckers, createTrip, getTruckByTruckerId, updateTruckerStatus } from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store"; // Import RootState from your store
import { router } from 'expo-router'
import IconSymbol from "react-native-vector-icons/FontAwesome"; // Make sure you import the icon library you're using.

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
  }, []);

  const handleInputChange = (key: keyof Trip, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTruckerId) {
      Alert.alert("Missing Info", "Please select trucker.");
      return;
    }

    try {
      const truck = await getTruckByTruckerId(selectedTruckerId);

      if (!truck) {
        Alert.alert("Error", "Selected trucker does not have a truck.");
        return;
      }

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
      router.push('/AdminDashboard');
    } catch (error) {
      console.error("Trip creation error:", error);
      Alert.alert("Error", "Failed to assign trip.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
              router.push('/AdminDashboard');
          }}
        >
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron-left" color="#333" />
            <Text style={styles.backButtonLabel}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>🚚 Assign New Trip</Text>

        <Text style={styles.label}>Select Active Trucker:</Text>
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

        <Text style={styles.label}>Start Location:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => handleInputChange("start_location", text)}
        />

        <Text style={styles.label}>End Location:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => handleInputChange("end_location", text)}
        />

        <Text style={styles.label}>Start Time (ISO):</Text>
        <TextInput
          style={styles.input}
          value={form.start_time}
          onChangeText={(text) => handleInputChange("start_time", text)}
        />

        <Text style={styles.label}>Distance (in km):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange("distance", parseFloat(text))}
        />

        <View style={styles.buttonContainer}>
          <Button title="Assign Trip" onPress={handleSubmit} color="#007AFF" />
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
  header: {
    marginTop: Math.max(screenHeight * 0.04, 24),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
  },
  backButton: {
    paddingVertical: Math.max(screenHeight * 0.01, 8),
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonLabel: {
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    color: '#333',
    marginBottom: screenHeight * 0.004,
    marginLeft: 5, // Add some space between the icon and the text
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonContainer: {
    marginTop: 30,
    borderRadius: 8,
    overflow: "hidden",
  },
});

export default TripAssignmentScreen;
