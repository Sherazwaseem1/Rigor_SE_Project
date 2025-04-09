import axios from "axios";
import { Platform } from "react-native";

// ✅ Set API URL based on platform (change IP if needed)
const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://192.168.90.204:5000/api"; // Replace with your IPv4 if necessary

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

export interface NewTrucker {
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
}

// ✅ Trucker APIs
export const getAllTruckers = async (): Promise<Trucker[]> => {
  const response = await axios.get<Trucker[]>(`${API_URL}/truckers`);
  return response.data;
};

export const getTruckerById = async (id: number): Promise<Trucker> => {
  const response = await axios.get<Trucker>(`${API_URL}/truckers/${id}`);
  return response.data;
};

export const getTruckerByEmail = async (email: string): Promise<Trucker> => {
  const response = await axios.get<Trucker>(
    `${API_URL}/truckers/email/${email}`
  );
  return response.data;
};

export const createTrucker = async (truckerData: NewTrucker): Promise<Trucker> => {
  const response = await axios.post<Trucker>(`${API_URL}/truckers`, truckerData);
  return response.data;
};

export const updateTrucker = async (
  id: number,
  truckerData: Partial<Trucker>
): Promise<Trucker> => {
  const response = await axios.put<Trucker>(
    `${API_URL}/truckers/${id}`,
    truckerData
  );
  return response.data;
};

export const deleteTrucker = async (
  id: number
): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/truckers/${id}`
  );
  return response.data;
};

export const updateTruckerStatus = async (truckerId: number, status: string) => {
  const response = await axios.patch(`${API_URL}/truckers/status/${truckerId}`, {
    status,
  });
  return response.data;
};

// ✅ Define TypeScript interfaces
export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  phone_number: string;
}

// ✅ Admin APIs
export const getAllAdmins = async (): Promise<Admin[]> => {
  const response = await axios.get<Admin[]>(`${API_URL}/admins`);
  return response.data;
};

export const getAdminById = async (id: number): Promise<Admin> => {
  const response = await axios.get<Admin>(`${API_URL}/admins/${id}`);
  return response.data;
};

// ✅ Exclude admin_id when creating a new admin
export const createAdmin = async (
  adminData: Omit<Admin, "admin_id">
): Promise<Admin> => {
  const response = await axios.post<Admin>(`${API_URL}/admins`, adminData);
  return response.data;
};

export const updateAdmin = async (
  id: number,
  adminData: Partial<Admin>
): Promise<Admin> => {
  const response = await axios.put<Admin>(`${API_URL}/admins/${id}`, adminData);
  return response.data;
};

export const deleteAdmin = async (id: number): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/admins/${id}`
  );
  return response.data;
};

export const getAdminByEmail = async (email: string): Promise<Admin> => {
  const response = await axios.get<Admin>(`${API_URL}/admins/email/${email}`);
  return response.data;
};

// ✅ Define TypeScript Interface for Location
export interface Location {
  location_id: number;
  trip_id: number; // Now a number instead of ObjectId
  latitude: number;
  longitude: number;
  timestamp: Date;
}

// ✅ Location APIs
export const getAllLocations = async (): Promise<Location[]> => {
  const response = await axios.get<Location[]>(`${API_URL}/locations`);
  return response.data;
};

export const getLocationById = async (id: number): Promise<Location> => {
  const response = await axios.get<Location>(`${API_URL}/locations/${id}`);
  return response.data;
};

export const createLocation = async (
  locationData: Location
): Promise<Location> => {
  const response = await axios.post<Location>(
    `${API_URL}/locations`,
    locationData
  );
  return response.data;
};

export const updateLocation = async (
  id: number,
  locationData: Partial<Location>
): Promise<Location> => {
  const response = await axios.put<Location>(
    `${API_URL}/locations/${id}`,
    locationData
  );
  return response.data;
};

export const deleteLocation = async (
  id: number
): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/locations/${id}`
  );
  return response.data;
};

export interface Reimbursement {
  reimbursement_id: number;
  trip_id: number;
  amount: {
    $numberDecimal: string; // MongoDB stores Decimal128 as an object
  };
  receipt_url: string;
  status: string;
  comments?: string;
  admin_id: number;
}


// ✅ Reimbursement APIs
export const getAllReimbursements = async (): Promise<Reimbursement[]> => {
  const response = await axios.get<Reimbursement[]>(
    `${API_URL}/reimbursements`
  );
  return response.data;
};

export const createReimbursement = async (
  reimbursementData: Omit<Reimbursement, 'reimbursement_id'> // Exclude reimbursement_id for creation
): Promise<Reimbursement> => {
  const response = await axios.post<Reimbursement>(
    `${API_URL}/reimbursements`,
    reimbursementData
  );
  return response.data;
};

export const getReimbursementsByTripId = async (
  trip_id: number
): Promise<Reimbursement[]> => {
  const response = await axios.get<Reimbursement[]>(
    `${API_URL}/reimbursements/trip/${trip_id}`
  );
  return response.data;
};

export const getReimbursementsByAdminId = async (
  admin_id: number
): Promise<Reimbursement[]> => {
  const response = await axios.get<Reimbursement[]>(
    `${API_URL}/reimbursements/admin/${admin_id}`
  );
  return response.data;
};

export const getReimbursementsByStatus = async (
  status: string
): Promise<Reimbursement[]> => {
  const response = await axios.get<Reimbursement[]>(
    `${API_URL}/reimbursements/status/${status}`
  );
  return response.data;
};

// ✅ Define TypeScript Interface for Trip
export interface Trip {
  trip_id: number;
  trucker_id: number;
  truck_id: number;
  start_location: string;
  end_location: string;
  start_time: string; // Date is stored as string in JSON
  end_time?: string; // Optional Date
  status: string;
  distance: number;
  assigned_by_admin_id: number;
  trip_rating: number; // Optional
}

// ✅ Trip APIs
export const getAllTrips = async (): Promise<Trip[]> => {
  const response = await axios.get<Trip[]>(`${API_URL}/trips`);
  return response.data;
};

export const getTripsByTruckerId = async (
  trucker_id: number
): Promise<Trip[]> => {
  const response = await axios.get<Trip[]>(
    `${API_URL}/trips/trucker/${trucker_id}`
  );
  return response.data;
};

export const getTripsByAdminId = async (admin_id: number): Promise<Trip[]> => {
  const response = await axios.get<Trip[]>(
    `${API_URL}/trips/admin/${admin_id}`
  );
  return response.data;
};

export const getTripsByStatus = async (status: string): Promise<Trip[]> => {
  const response = await axios.get<Trip[]>(`${API_URL}/trips/status/${status}`);
  return response.data;
};

export const createTrip = async (trip: Omit<Trip, 'trip_id'>): Promise<Trip> => {
  const response = await axios.post(`${API_URL}/trips`, trip);
  return response.data;
};

// ✅ Define TypeScript Interface for Truck
export interface Truck {
  truck_id: number;
  license_plate: string;
  chassis_number: string;
  capacity: number;
  assigned_trucker_id?: number; // Optional
}

// ✅ Truck APIs
export const getAllTrucks = async (): Promise<Truck[]> => {
  const response = await axios.get<Truck[]>(`${API_URL}/trucks`);
  return response.data;
};

// ✅ Define the type for truck creation request (without truck_id)
export interface CreateTruckRequest {
  license_plate: string;
  chassis_number: string;
  capacity: number;
  assigned_trucker_id?: number;
}

// ✅ Update API function to exclude `truck_id` from request
export const createTruck = async (truckData: CreateTruckRequest): Promise<Truck> => {
  const response = await axios.post<Truck>(`${API_URL}/trucks`, truckData);
  return response.data;
};

export const getTruckByTruckerId = async (truckerId: number) => {
  const res = await fetch(`${API_URL}/trucks/by-trucker/${truckerId}`);
  if (!res.ok) throw new Error("Failed to fetch truck for trucker");
  return res.json();
};