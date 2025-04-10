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
  Dimensions,
  ActivityIndicator, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DropDownPicker from 'react-native-dropdown-picker';
import { Trip, Trucker, getAllTruckers, createTrip, getTruckByTruckerId, updateTruckerStatus } from "../../services/api";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { router } from 'expo-router';
import IconSymbol from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";

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
    assigned_by_admin_id: 0,
  });
  
  // State for dropdown pickers
  const [startLocationOpen, setStartLocationOpen] = useState(false);
  const [endLocationOpen, setEndLocationOpen] = useState(false);
  
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
    
    if (!form.start_location) {
      Alert.alert("Missing Info", "Please select a start location.");
      return;
    }
    
    if (!form.end_location) {
      Alert.alert("Missing Info", "Please select an end location.");
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

      await createTrip(newTrip);
      await updateTruckerStatus(selectedTruckerId, "Active");
      Alert.alert("Success", "Trip assigned successfully!");

      handleClear();
      
      router.push('/AdminDashboard');

    } catch (error) {
      console.error("Trip creation error:", error);
      Alert.alert("Unable to Process your request", "Selected trucker does not have a truck");
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
      assigned_by_admin_id: 0,
    });
  
    setSelectedTruckerId(null);
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

        <Text style={styles.label}>Select InActive Trucker:</Text>
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

        <Text style={[styles.label, { marginTop: endLocationOpen ? 200 : 15 }]}>Start Time (ISO):</Text>
        <TextInput
          style={styles.input}
          value={form.start_time}
          onChangeText={(text) => handleInputChange("start_time", text)}
        />

        <Text style={styles.label}>Distance (in km):</Text>
        <TextInput
          style={styles.input}
          value={form.distance ? form.distance.toString() : ""}
          keyboardType="numeric"
          onChangeText={(text) => handleInputChange("distance", parseFloat(text) || 0)}
        />

        <View style={styles.buttonContainer}>
          <Button title="Assign Trip" onPress={handleSubmit} color="#007AFF" />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Clear Form" onPress={handleClear} color="#FF3B30" />
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
    marginLeft: 5,
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
  dropdownPicker: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  dropdownContainer: {
    borderColor: "#ccc",
    backgroundColor: "#fff",
    maxHeight: 200,
  },
});

export default TripAssignmentScreen;