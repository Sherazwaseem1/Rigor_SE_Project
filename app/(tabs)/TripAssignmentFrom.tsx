// TripAssignmentFrom.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { 
  Trip, 
  Trucker, 
  getAllTruckers, 
  createTrip, 
  getTruckByTruckerId, 
  updateTruckerStatus,
  estimateTripCost,
  createLocation
} from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import IconSymbol from "react-native-vector-icons/FontAwesome";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const pakistaniCities = [
  { label: 'Karachi', value: 'Karachi' },
  { label: 'Lahore', value: 'Lahore' },
  { label: 'Islamabad', value: 'Islamabad' },
  { label: 'Rawalpindi', value: 'Rawalpindi' },
  { label: 'Faisalabad', value: 'Faisalabad' },
  { label: 'Multan', value: 'Multan' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Peshawar', value: 'Peshawar' },
  { label: 'Quetta', value: 'Quetta' },
  { label: 'Sialkot', value: 'Sialkot' },
  { label: 'Gujranwala', value: 'Gujranwala' },
  { label: 'Sargodha', value: 'Sargodha' },
  { label: 'Bahawalpur', value: 'Bahawalpur' },
  { label: 'Sukkur', value: 'Sukkur' },
  { label: 'Larkana', value: 'Larkana' },
  { label: 'Sheikhupura', value: 'Sheikhupura' },
  { label: 'Rahim Yar Khan', value: 'Rahim Yar Khan' },
  { label: 'Jhang', value: 'Jhang' },
  { label: 'Dera Ghazi Khan', value: 'Dera Ghazi Khan' },
  { label: 'Gujrat', value: 'Gujrat' },
  { label: 'Sahiwal', value: 'Sahiwal' },
  { label: 'Wah Cantonment', value: 'Wah Cantonment' },
  { label: 'Kasur', value: 'Kasur' },
  { label: 'Okara', value: 'Okara' },
  { label: 'Chiniot', value: 'Chiniot' },
  { label: 'Kamoke', value: 'Kamoke' },
  { label: 'Nawabshah', value: 'Nawabshah' },
  { label: 'Burewala', value: 'Burewala' },
  { label: 'Jhelum', value: 'Jhelum' },
  { label: 'Sadiqabad', value: 'Sadiqabad' },
  { label: 'Khanewal', value: 'Khanewal' },
  { label: 'Hafizabad', value: 'Hafizabad' },
  { label: 'Mirpur Khas', value: 'Mirpur Khas' },
  { label: 'Attock', value: 'Attock' },
  { label: 'Muzaffarabad', value: 'Muzaffarabad' },
  { label: 'Abbottabad', value: 'Abbottabad' },
  { label: 'Mardan', value: 'Mardan' },
  { label: 'Swat', value: 'Swat' },
  { label: 'Gilgit', value: 'Gilgit' },
  { label: 'Skardu', value: 'Skardu' },
].sort((a, b) => a.label.localeCompare(b.label));

const TripAssignmentScreen: React.FC = () => {
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [selectedTruckerId, setSelectedTruckerId] = useState<number | null>(null);
  const [truckerOpen, setTruckerOpen] = useState(false);

  const [form, setForm] = useState<Partial<Trip>>({
    truck_id: 0,
    start_location: "",
    end_location: "",
    start_time: new Date().toISOString(),
    status: "Scheduled",
    distance: 0,
    expected_cost: 0,
    assigned_by_admin_id: 0,
  });

  const [startLocationOpen, setStartLocationOpen] = useState(false);
  const [endLocationOpen, setEndLocationOpen] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const truckerData = await getAllTruckers();
        const activeTruckers = truckerData.filter(t => t.status === "Inactive");
        setTruckers(activeTruckers);
      } catch (error) {}
    };
    fetchTruckers();
    handleClear();
  }, [isFocused]);

  useEffect(() => {
    setEstimatedCost(null);
  }, [form.start_location, form.end_location, form.distance]);

  const handleInputChange = (key: keyof Trip, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTruckerId || !form.start_location || !form.end_location || !form.expected_cost) {
      Alert.alert("Missing Info", "All fields are required.");
      return;
    }

    try {
      const truck = await getTruckByTruckerId(selectedTruckerId);
      const newTrip = {
        ...form,
        truck_id: truck.truck_id,
        trucker_id: selectedTruckerId,
        assigned_by_admin_id: user.id,
        end_time: undefined,
        trip_rating: 0,
      } as Omit<Trip, "trip_id">;

      const createdTrip = await createTrip(newTrip);
      const createdTripId = createdTrip.trip_id;
      await updateTruckerStatus(selectedTruckerId, "Active");
      Alert.alert("Success", "Trip assigned successfully!");

      // ✅ Dummy location data
    const dummyLocation = {
      location_id: Date.now(), // simple unique ID for example
      trip_id: createdTripId,
      latitude: 31.5204, // Lahore example
      longitude: 74.3587,
      timestamp: new Date(),
    };

    await createLocation(dummyLocation);


      handleClear();
      router.push("/AdminDashboardNew");
    } catch (error) {
      Alert.alert("Error", "Selected trucker does not have a truck.");
    }
  };

  const handleGetCostEstimate = async () => {
    if (!form.start_location || !form.end_location || !form.distance) {
      Alert.alert("Missing Info", "Provide all inputs for cost estimation.");
      return;
    }

    setIsLoadingCost(true);
    try {
      const res = await estimateTripCost(
        form.start_location!,
        form.end_location!,
        form.distance
      );
      setEstimatedCost(res.estimated_cost);
      handleInputChange("expected_cost", parseFloat(res.estimated_cost));
    } catch (err) {
      Alert.alert("Error", "Failed to estimate cost.");
    } finally {
      setIsLoadingCost(false);
    }
  };

  const handleClear = () => {
    setForm({
      truck_id: 0,
      start_location: "",
      end_location: "",
      start_time: new Date().toISOString(),
      status: "Scheduled",
      distance: 0,
      expected_cost: 0,
      assigned_by_admin_id: 0,
    });
    setSelectedTruckerId(null);
    setEstimatedCost(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/AdminDashboardNew')}>
            <View style={styles.backButtonContent}>
              <IconSymbol size={20} name="chevron-left" color="#202545" />
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

        <Text style={styles.title}>Assign New Trip</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Trucker</Text>
          <DropDownPicker
            open={truckerOpen}
            value={selectedTruckerId}
            items={truckers.map(t => ({
              label: t.name,
              value: t.trucker_id
            }))}
            setOpen={setTruckerOpen}
            setValue={setSelectedTruckerId}
            placeholder="Select Trucker"
            style={styles.input}
            dropDownContainerStyle={styles.input}
            zIndex={4000}
            zIndexInverse={1000}
          />

          <Text style={styles.label}>Start Location</Text>
          <DropDownPicker
            open={startLocationOpen}
            value={form.start_location}
            items={pakistaniCities}
            setOpen={setStartLocationOpen}
            setValue={(cb) => handleInputChange("start_location", typeof cb === "function" ? cb(form.start_location) : cb)}
            placeholder="Select Start City"
            style={styles.input}
            dropDownContainerStyle={styles.input}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <Text style={styles.label}>End Location</Text>
          <DropDownPicker
            open={endLocationOpen}
            value={form.end_location}
            items={pakistaniCities}
            setOpen={setEndLocationOpen}
            setValue={(cb) => handleInputChange("end_location", typeof cb === "function" ? cb(form.end_location) : cb)}
            placeholder="Select End City"
            style={styles.input}
            dropDownContainerStyle={styles.input}
            zIndex={2000}
            zIndexInverse={2000}
          />

          <Text style={styles.label}>Distance (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter distance"
            keyboardType="numeric"
            value={form.distance?.toString()}
            onChangeText={(text) => handleInputChange("distance", parseFloat(text))}
          />

          <Text style={styles.label}>Expected Cost (PKR)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter cost"
            keyboardType="numeric"
            value={form.expected_cost?.toString()}
            onChangeText={(text) => handleInputChange("expected_cost", parseFloat(text))}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleGetCostEstimate}>
            <Text style={styles.submitButtonText}>
              {isLoadingCost ? "Calculating..." : "Get Cost Estimate"}
            </Text>
            {isLoadingCost && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: "#FF3B30" }]}
            onPress={handleClear}
          >
            <Text style={styles.submitButtonText}>Clear Form</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Math.max(screenHeight * 0.025, 20),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
  },
  header: {
    marginBottom: Math.max(screenHeight * 0.02, 15),
  },
  backButton: {
    paddingVertical: Math.max(screenHeight * 0.012, 10),
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonLabel: {
    fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
    fontWeight: '500',
    marginLeft: 8,
    color: '#202545',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Math.max(screenHeight * 0.02, 15),
    marginBottom: Math.max(screenHeight * 0.03, 25),
    height: Math.min(screenHeight * 0.15, 100),
  },
  logo: {
    width: Math.min(screenWidth * 0.45, 180),
    height: '100%',
  },
  title: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
    fontWeight: '600',
    marginBottom: Math.max(screenHeight * 0.025, 20),
    textAlign: 'center',
    color: '#202545',
  },
  inputContainer: {
    marginBottom: Math.max(screenHeight * 0.025, 20),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    paddingVertical: Math.max(screenHeight * 0.02, 16),
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
    marginBottom: Math.max(screenHeight * 0.012, 10),
    marginTop: Math.max(screenHeight * 0.015, 12),
    fontWeight: '500',
    color: '#202545',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Math.max(screenHeight * 0.015, 12),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
    height: Math.max(screenHeight * 0.06, 48),
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#088395',
    borderRadius: 8,
    paddingVertical: Math.max(screenHeight * 0.012, 10),
    marginTop: Math.max(screenHeight * 0.015, 12),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    marginHorizontal: Math.max(screenWidth * 0.04, 15),
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
    fontWeight: '600',
  },
});

export default TripAssignmentScreen;
