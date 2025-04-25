import React, { useEffect, useState } from "react";
import styles from '../../assets/styles/styleTripAssignmentForm';
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { 
  getAllTruckers, 
  createTrip, 
  getTruckByTruckerId, 
  updateTruckerStatus,
  estimateTripCost,
  createLocation,
  getTruckersWithoutTruck,
  sendEmailNotification
} from "../../services/api";
import { Trip, Trucker } from "../../services/util";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import IconSymbol from "react-native-vector-icons/FontAwesome";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const pakistaniCities = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Multan",
  "Hyderabad","Peshawar","Quetta","Sialkot","Gujranwala","Sargodha",
  "Bahawalpur","Sukkur","Larkana","Sheikhupura","Rahim Yar Khan","Jhang",
  "Dera Ghazi Khan","Gujrat","Sahiwal","Wah Cantonment","Kasur","Okara",
  "Chiniot","Kamoke","Nawabshah","Burewala","Jhelum","Sadiqabad","Khanewal",
  "Hafizabad","Mirpur Khas","Attock","Muzaffarabad","Abbottabad","Mardan",
  "Swat","Gilgit","Skardu"
].sort();

const TripAssignmentScreen: React.FC = () => {
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [selectedTruckerId, setSelectedTruckerId] = useState<number | null>(null);

  const [form, setForm] = useState<Partial<Trip>>({
    start_location: "",
    end_location: "",
    start_time: new Date().toISOString(),
    status: "Scheduled",
    distance: undefined,    
    expected_cost: undefined, 
  });

  const [estimatedCost, setEstimatedCost] = useState<string | null>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const all = await getAllTruckers();
        const inactive = all.filter(t => t.status === "Inactive");
        const withoutTruck = await getTruckersWithoutTruck();
        const withTruck = inactive.filter(t => !withoutTruck.some(w => w.trucker_id === t.trucker_id));
        setTruckers(withTruck);
      } catch {
        Alert.alert("Error", "Could not fetch truckers.");
      }
    };
    fetchTruckers();
    clearForm();
  }, [isFocused]);

  const handleInputChange = (key: keyof Trip, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const clearForm = () => {
    setForm({
      start_location: "",
      end_location: "",
      start_time: new Date().toISOString(),
      status: "Scheduled",
      distance: undefined,
      expected_cost: undefined,
    });
    setSelectedTruckerId(null);
    setEstimatedCost(null);
  };

  const handleGetCostEstimate = async () => {
    if (!form.start_location || !form.end_location || form.distance == null) {
      Alert.alert("Missing Info", "Provide all inputs for cost estimation.");
      return;
    }
    setIsLoadingCost(true);
    try {
      const res = await estimateTripCost(
        form.start_location!,
        form.end_location!,
        form.distance!
      );
      setEstimatedCost(res.estimated_cost);
      handleInputChange("expected_cost", parseFloat(res.estimated_cost));
    } catch {
      Alert.alert("Error", "Failed to estimate cost.");
    } finally {
      setIsLoadingCost(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTruckerId || !form.start_location || !form.end_location || form.expected_cost == null) {
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

      const created = await createTrip(newTrip);
      await updateTruckerStatus(selectedTruckerId, "Active");
      const assignedTrucker = truckers.find(t => t.trucker_id === selectedTruckerId);
      
      if (assignedTrucker) {
        const emailHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #088395; padding: 20px; color: #ffffff; text-align: center;">
              <h2 style="margin: 0; font-size: 24px;">🚚 New Trip Assigned!</h2>
            </div>
            <div style="padding: 20px;">
              <p style="font-size: 16px;">Dear <strong>${assignedTrucker.name}</strong>,</p>
              <p style="font-size: 16px;">You’ve been assigned a new trip. Here are the details:</p>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Start Location</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${form.start_location}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>End Location</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${form.end_location}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Distance</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${form.distance} km</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Start Time</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${form.start_time}</td>
                </tr>
              </table>
        
              <p style="margin-top: 20px; font-size: 16px;">
                Please make sure to prepare for your trip and reach out if you have any questions.
              </p>
        
              <p style="color: #888; font-size: 14px; margin-top: 30px;">
                — Rigor Logistics Admin Panel
              </p>
            </div>
          </div>
        </div>
        `;
        try {
          await sendEmailNotification(
            assignedTrucker.email,
            "🚚 New Trip Assigned | Rigor Logistics",
            emailHTML
          );
        } catch {
        }
      }
      
      Alert.alert("Success", "Trip assigned successfully!");
      

      await createLocation({
        location_id: Date.now(),
        trip_id: created.trip_id,
        latitude: 31.5204,
        longitude: 74.3587,
        timestamp: new Date(),
      });

      clearForm();
      router.push("/AdminDashboardNew");
    } catch {
      Alert.alert("Error", "Selected trucker does not have a truck.");
    }
  };

  return (
    <SafeAreaView flex={1} backgroundColor="#fff" padding={20}>
      <ScrollView showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.push('/AdminDashboardNew')} style={styles.backButton}>
          <IconSymbol name="chevron-left" size={20} color="#202545" />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        <Image source={require("../../assets/images/rigor_no_bg.jpeg")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Assign New Trip</Text>

        <Text style={styles.label}>Trucker</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedTruckerId}
            onValueChange={val => setSelectedTruckerId(val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Trucker" value={null} />
            {truckers.map(t => (
              <Picker.Item key={t.trucker_id} label={t.name} value={t.trucker_id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Start Location</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.start_location || ""}
            onValueChange={val => handleInputChange("start_location", val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Start City" value="" />
            {pakistaniCities.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
        </View>

        <Text style={styles.label}>End Location</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.end_location || ""}
            onValueChange={val => handleInputChange("end_location", val)}
            style={styles.picker}
          >
            <Picker.Item label="Select End City" value="" />
            {pakistaniCities.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Distance (km)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          value={form.distance != null ? String(form.distance) : ""}
          onChangeText={t => handleInputChange("distance", t === "" ? undefined : parseFloat(t))}
        />

        <Text style={styles.label}>Expected Cost (PKR)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          value={form.expected_cost != null ? String(form.expected_cost) : ""}
          onChangeText={t => handleInputChange("expected_cost", t === "" ? undefined : parseFloat(t))}
        />

        <TouchableOpacity style={styles.button} onPress={handleGetCostEstimate}>
          <Text style={styles.buttonText}>{isLoadingCost ? "Calculating..." : "Get Cost Estimate By AI"}</Text>
          {isLoadingCost && <ActivityIndicator style={{ marginLeft: 8 }} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearForm}>
          <Text style={styles.buttonText}>Clear Form</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripAssignmentScreen;