import axios from "axios";
import { Platform } from "react-native";
import {
  Trucker,
  NewTrucker,
  Admin,
  Location,
  Reimbursement,
  Trip,
  Truck,
  CreateTruckRequest,
  TripCostEstimate,
  EmailResponse,
} from "./util";

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : "http://192.168.1.107:5000/api";

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

export const createTrucker = async (
  truckerData: NewTrucker
): Promise<Trucker> => {
  const response = await axios.post<Trucker>(
    `${API_URL}/truckers`,
    truckerData
  );
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

export const updateTruckerStatus = async (
  truckerId: number,
  status: string
) => {
  const response = await axios.patch(
    `${API_URL}/truckers/status/${truckerId}`,
    {
      status,
    }
  );
  return response.data;
};

export const updateTruckerProfilePic = async (
  truckerId: number,
  profile_pic_url: string
) => {
  const response = await axios.patch(
    `${API_URL}/truckers/profile-pic/${truckerId}`,
    { profile_pic_url }
  );
  return response.data;
};

export const getTruckerProfilePic = async (truckerId: number) => {
  const response = await axios.get<{ profile_pic_url: string | null }>(
    `${API_URL}/truckers/profile-pic/${truckerId}`
  );
  return response.data;
};

export const updateTruckerRating = async (
  truckerId: number,
  rating: number
): Promise<Trucker> => {
  const response = await axios.patch<Trucker>(
    `${API_URL}/truckers/rating/${truckerId}`,
    { rating }
  );
  return response.data;
};

export const getAllAdmins = async (): Promise<Admin[]> => {
  const response = await axios.get<Admin[]>(`${API_URL}/admins`);
  return response.data;
};

export const getAdminById = async (id: number): Promise<Admin> => {
  const response = await axios.get<Admin>(`${API_URL}/admins/${id}`);
  return response.data;
};

export const createAdmin = async (
  adminData: Omit<Admin, "admin_id">
): Promise<Admin> => {
  const response = await axios.post<Admin>(`${API_URL}/admins`, adminData);
  return response.data;
};

export const updateAdmin = async (
  id: number,
  adminData: Partial<Omit<Admin, "admin_id">>
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

export const getAdminProfileImage = async (
  id: number
): Promise<{ profile_pic_url: string | null }> => {
  const response = await axios.get<{ profile_pic_url: string | null }>(
    `${API_URL}/admins/profile-pic/${id}`
  );
  return response.data;
};

export const updateAdminProfileImage = async (
  id: number,
  profile_pic_url: string
): Promise<Admin> => {
  const response = await axios.patch<Admin>(
    `${API_URL}/admins/profile-pic/${id}`,
    { profile_pic_url }
  );
  return response.data;
};

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

export const getAllReimbursements = async (): Promise<Reimbursement[]> => {
  const response = await axios.get<Reimbursement[]>(
    `${API_URL}/reimbursements`
  );
  return response.data;
};

export const createReimbursement = async (
  reimbursementData: Omit<Reimbursement, "reimbursement_id">
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

export const approveReimbursement = async (
  reimbursement_id: number,
  admin_id: number
) =>
  axios
    .patch<Reimbursement>(
      `${API_URL}/reimbursements/${reimbursement_id}/approve`,
      { admin_id }
    )
    .then((r) => r.data);

export const modifyReimbursement = async (
  reimbursement_id: number,
  data: { amount?: number; comments?: string }
) =>
  axios
    .patch<Reimbursement>(`${API_URL}/reimbursements/${reimbursement_id}`, data)
    .then((r) => r.data);

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

export const createTrip = async (
  trip: Omit<Trip, "trip_id">
): Promise<Trip> => {
  const response = await axios.post(`${API_URL}/trips`, trip);
  return response.data;
};

export const completeTrip = async (trip_id: number): Promise<Trip> => {
  try {
    const response = await axios.patch<Trip>(`${API_URL}/trips/${trip_id}`, {
      status: "Completed",
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTripRating = async (
  trip_id: number,
  rating: number
): Promise<Trip> => {
  const response = await axios.patch<Trip>(
    `${API_URL}/trips/${trip_id}/rating`,
    {
      rating,
    }
  );
  return response.data;
};

export const getAllTrucks = async (): Promise<Truck[]> => {
  const response = await axios.get<Truck[]>(`${API_URL}/trucks`);
  return response.data;
};

export const createTruck = async (
  truckData: CreateTruckRequest
): Promise<Truck> => {
  const response = await axios.post<Truck>(`${API_URL}/trucks`, truckData);
  return response.data;
};

export const getTruckByTruckerId = async (truckerId: number) => {
  const res = await fetch(`${API_URL}/trucks/by-trucker/${truckerId}`);
  if (!res.ok) throw new Error("Failed to fetch truck for trucker");
  return res.json();
};

export const getTruckersWithoutTruck = async (): Promise<Trucker[]> => {
  const response = await axios.get<Trucker[]>(
    `${API_URL}/trucks/without-truck`
  );
  return response.data;
};

export const estimateTripCost = async (
  start_location: string,
  end_location: string,
  distance: number
): Promise<TripCostEstimate> => {
  const response = await axios.post<TripCostEstimate>(
    `${API_URL}/llm/estimate`,
    {
      start_location,
      end_location,
      distance,
    }
  );
  return response.data;
};

export const sendEmailNotification = async (
  to: string,
  subject: string,
  text: string
): Promise<EmailResponse> => {
  const response = await axios.post<EmailResponse>(
    `${API_URL}/email/send-email`,
    {
      to,
      subject,
      html: text,
    }
  );
  return response.data;
};
