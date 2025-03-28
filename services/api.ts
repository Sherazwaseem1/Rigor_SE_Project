import axios from "axios";
import { Platform } from "react-native";

// const API_URL = "http://localhost:5000/api"; // Change this if using a physical device

// Change the IP below according to your network setup (Laptop + mobile => Same network)
// ipconfig => Wi-Fi => IPv4 Address => pconfig => Wi-Fi => IPv4 Address => IP_ADDRESS66 => Laptop

const API_URL = Platform.OS === "web" 
  ? "http://localhost:5000/api" 
  : "http://10.130.81.166:5000/api"; // Mobile devices use the laptop's IP

export const getTruckers = async () => {
  try {
    const response = await axios.get(`${API_URL}/truckers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching truckers:", error);
    throw error;
  }
};

export const addTrucker = async (truckerData: object) => {
  try {
    const response = await axios.post(`${API_URL}/truckers`, truckerData);
    return response.data;
  } catch (error) {
    console.error("Error adding trucker:", error);
    throw error;
  }
};
