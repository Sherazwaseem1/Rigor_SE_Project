export interface Trucker {
  trucker_id: number;
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
  profile_pic_url?: string | null;
}

export interface NewTrucker {
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
  profile_pic_url?: string | null;
}

export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  phone_number: string;
  profile_pic_url?: string;
}

export interface Location {
  location_id: number;
  trip_id: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export interface Reimbursement {
  reimbursement_id: number;
  trip_id: number;
  amount: {
    $numberDecimal: string;
  };
  receipt_url: string;
  status: string;
  comments?: string;
  admin_id: number;
}

export interface Trip {
  trip_id: number;
  trucker_id: number;
  truck_id: number;
  start_location: string;
  end_location: string;
  start_time: string;
  end_time?: string;
  status: string;
  distance: number;
  assigned_by_admin_id: number;
  trip_rating?: number;
  expected_cost?: number;
}

export interface Truck {
  truck_id: number;
  license_plate: string;
  chassis_number: string;
  capacity: number;
  assigned_trucker_id?: number;
}

export interface CreateTruckRequest {
  license_plate: string;
  chassis_number: string;
  capacity: number;
  assigned_trucker_id?: number;
}

export interface TripCostEstimate {
  estimated_cost: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}
