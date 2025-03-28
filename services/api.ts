import axios from "axios";
import { Platform } from "react-native";

// ✅ Set API URL based on platform (change IP if needed)
const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://10.130.81.166:5000/api"; // Replace with your IPv4 if necessary

// ✅ Define Trucker Interface
export interface Trucker {
  trucker_id: number;
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
}

// ✅ Fetch all truckers
export const getTruckers = async (): Promise<Trucker[]> => {
  try {
    const response = await axios.get<Trucker[]>(`${API_URL}/truckers`);
    return response.data;
  } catch (error) {
    console.error("Error fetching truckers:", error);
    throw error;
  }
};

// ✅ Fetch a single trucker by ID
export const getTruckerById = async (truckerId: number): Promise<Trucker> => {
  try {
    const response = await axios.get<Trucker>(`${API_URL}/truckers/${truckerId}`); // ✅ Fix: Correct endpoint
    return response.data;
  } catch (error) {
    console.error(`Error fetching trucker with ID ${truckerId}:`, error);
    throw error;
  }
};


// ✅ Add a new trucker
export const addTrucker = async (truckerData: Omit<Trucker, "trucker_id">): Promise<Trucker> => {
  try {
    const response = await axios.post<Trucker>(`${API_URL}/truckers`, truckerData);
    return response.data;
  } catch (error) {
    console.error("Error adding trucker:", error);
    throw error;
  }
};

// ✅ Update an existing trucker by ID
export const updateTrucker = async (truckerId: number, truckerData: Partial<Trucker>): Promise<Trucker> => {
  try {
    const response = await axios.put<Trucker>(`${API_URL}/truckers/${truckerId}`, truckerData);
    return response.data;
  } catch (error) {
    console.error(`Error updating trucker with ID ${truckerId}:`, error);
    throw error;
  }
};

// ✅ Delete a trucker by ID
export const deleteTrucker = async (truckerId: number): Promise<{ message: string }> => {
  try {
    await axios.delete(`${API_URL}/truckers/${truckerId}`);
    return { message: "Trucker deleted successfully" };
  } catch (error) {
    console.error(`Error deleting trucker with ID ${truckerId}:`, error);
    throw error;
  }
};
