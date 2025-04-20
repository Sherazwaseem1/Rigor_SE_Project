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
  Image,
  Button,
  ActivityIndicator, 
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
import { RootState } from "../../redux/store"; // Import RootState from your store
import { router } from 'expo-router'
import IconSymbol from "react-native-vector-icons/FontAwesome"; // Make sure you import the icon library you're using.
import { useIsFocused } from "@react-navigation/native";
import DropDownPicker from 'react-native-dropdown-picker';


const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// List of major Pakistani cities
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
  { label: 'Skardu', value: 'Skardu' }
].sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically


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
    expected_cost: 0,
    assigned_by_admin_id: 0,
  });

  // State for dropdown pickers
  const [startLocationOpen, setStartLocationOpen] = useState(false);
  const [endLocationOpen, setEndLocationOpen] = useState(false);
  
  // State for cost estimation
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
      } catch (error) {
        
      }
    };
    fetchTruckers();
    handleClear();
  }, [isFocused]);

    // Reset estimated cost when any inputs change
  useEffect(() => {
    setEstimatedCost(null);
  }, [form.start_location, form.end_location, form.distance]);


  const handleInputChange = (key: keyof Trip, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGetCostEstimate = async () => {
      // Validate required fields
      if (!form.start_location || !form.end_location || !form.distance) {
        Alert.alert(
          "Missing Information", 
          "Please select both start and end locations, and enter a distance to get a cost estimate."
        );
        return;
      }
      
      setIsLoadingCost(true);
      try {
        const costEstimate = await estimateTripCost(
          form.start_location as string,
          form.end_location as string,
          form.distance
        );
        
        setEstimatedCost(costEstimate.estimated_cost);
        handleInputChange("expected_cost", parseFloat(costEstimate.estimated_cost));
  
      } catch (error) {
        console.error("Error getting cost estimate:", error);
        Alert.alert("Error", "Could not get cost estimate. Please try again.");
      } finally {
        setIsLoadingCost(false);
      }
    };
  

  const handleSubmit = async () => {
    if (!selectedTruckerId) {
      Alert.alert("Missing Info", "Please select trucker.");
      return;
    }
    
    if (!form.start_location) {
      Alert.alert("Missing Info", "Please select a start location.");
      return;
    }
    
    if (!form.end_location) {
      Alert.alert("Missing Info", "Please select an end location.");
      return;
    }

    if (!form.expected_cost)
    {
      Alert.alert("Missing Info", "Please enter expected cost.");
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
    
      setSelectedTruckerId(null);
      setEstimatedCost(null);
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

        <View style={[{ marginTop: 16 }]}>
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

          <Text style={styles.label}>Start Location:</Text>
        <DropDownPicker
          open={startLocationOpen}
          value={form.start_location as string}
          items={pakistaniCities}
          setOpen={setStartLocationOpen}
          setValue={(callback) => {
            if (typeof callback === 'function') {
              const newValue = callback(form.start_location as string);
              handleInputChange('start_location', newValue);
            } else {
              handleInputChange('start_location', callback);
            }
          }}
          searchable={true}
          searchPlaceholder="Search for a city..."
          placeholder="Select start location"
          style={styles.dropdownPicker}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          zIndex={3000}
          zIndexInverse={1000}
        />

        <Text style={[styles.label, { marginTop: startLocationOpen ? 200 : 15 }]}>End Location:</Text>
        <DropDownPicker
          open={endLocationOpen}
          value={form.end_location as string}
          items={pakistaniCities}
          setOpen={setEndLocationOpen}
          setValue={(callback) => {
            if (typeof callback === 'function') {
              const newValue = callback(form.end_location as string);
              handleInputChange('end_location', newValue);
            } else {
              handleInputChange('end_location', callback);
            }
          }}
          searchable={true}
          searchPlaceholder="Search for a city..."
          placeholder="Select destination"
          style={styles.dropdownPicker}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          zIndex={2000}
          zIndexInverse={2000}
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

        <Text style={styles.label}>Expected Cost (PKR):</Text>
        <TextInput
          style={styles.input}
          value={form.expected_cost ? form.expected_cost.toString() : ""}
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange("expected_cost", parseFloat(text) || 0)}
        />

        {/* Cost Estimation Section */}
        <View style={styles.costEstimationSection}>
          <TouchableOpacity
            style={styles.estimateButton}
            onPress={handleGetCostEstimate}
            disabled={isLoadingCost}
          >
            <Text style={styles.estimateButtonText}>
              {isLoadingCost ? "Calculating..." : "Get Cost Estimate By AI"}
            </Text>
            {isLoadingCost && (
              <ActivityIndicator size="small" color="#fff" style={styles.estimateLoader} />
            )}
          </TouchableOpacity>

          {estimatedCost && (
            <View style={styles.estimatedCostContainer}>
              <Text style={styles.estimatedCostLabel}>Estimated Trip Cost (PKR):</Text>
              <Text style={styles.estimatedCostValue}>{estimatedCost}</Text>
            </View>
          )}
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
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: Math.max(screenHeight * 0.02, 14),
    height: Math.max(screenHeight * 0.06, 50),
  },
  picker: {
    height: Math.max(screenHeight * 0.06, 50),
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
  dropdownPicker: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  costEstimationSection: {
    marginTop: 20,
    marginBottom: 10,
    padding: 15,
    backgroundColor: "#f0f8ff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1e9ff",
  },
  estimateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  estimateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  estimateLoader: {
    marginLeft: 10,
  },
  estimatedCostContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  estimatedCostLabel: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  estimatedCostValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
});

export default TripAssignmentScreen;
