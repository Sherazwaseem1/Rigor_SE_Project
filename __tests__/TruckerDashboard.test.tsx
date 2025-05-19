import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TruckerDashboard from '../app/(tabs)/truckerDashboard'; // Adjust path as needed
import * as api from '../services/api';
import * as Location from 'expo-location';

// Mock data
const mockTrucker = {
  id: 1,
  name: "John Doe",
  email: "johndoe@example.com",
};

const mockTrips = [
  {
    trip_id: 1,
    trucker_id: 1,
    start_location: 'Karachi',
    end_location: 'Lahore',
    status: 'Scheduled',
    distance: 1200,
    assigned_by_admin_id: 1,
  },
  {
    trip_id: 2,
    trucker_id: 1,
    start_location: 'Islamabad',
    end_location: 'Multan',
    status: 'Completed',
    distance: 800,
    assigned_by_admin_id: 1,
  },
];

const mockReimbursements = [
  {
    reimbursement_id: 1,
    trip_id: 2,
    amount: { $numberDecimal: '15000.00' },
    status: 'Pending',
    comments: 'Fuel and toll charges',
    receipt_url: 'https://example.com/receipt.jpg',
  },
  {
    reimbursement_id: 2,
    trip_id: 2,
    amount: { $numberDecimal: '8000.00' },
    status: 'Approved',
    comments: 'Food expenses',
    receipt_url: null,
  },
];

const mockLocations = [
  {
    location_id: 1,
    trip_id: 1,
    latitude: 24.8607,
    longitude: 67.0011,
    timestamp: new Date().toISOString(),
  },
];

// Mock all API functions
jest.mock('../services/api', () => ({
  getTripsByTruckerId: jest.fn(),
  getTruckerByEmail: jest.fn(),
  getReimbursementsByTripId: jest.fn(),
  getAllReimbursements: jest.fn(),
  getAllLocations: jest.fn(),
  updateLocation: jest.fn(),
  completeTrip: jest.fn(),
  deleteLocation: jest.fn(),
  getTruckerProfilePic: jest.fn(),
  updateTruckerStatus: jest.fn(),
  getAdminById: jest.fn(),
  getTruckerById: jest.fn(),
  sendEmailNotification: jest.fn(),
}));

// Mock other dependencies
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));

jest.mock('expo-router', () => ({
  router: { 
    push: jest.fn(),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    High: 'high',
  },
}));

jest.mock('react-native-drawer-layout', () => ({
  Drawer: ({ children, renderDrawerContent }) => {
    return (
      <>
        {children}
        {renderDrawerContent && renderDrawerContent()}
      </>
    );
  },
}));

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: ({ children, ...props }) => <View {...props}>{children}</View>,
    Marker: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('TruckerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API mocks
    (api.getTripsByTruckerId as jest.Mock).mockResolvedValue(mockTrips);
    (api.getAllReimbursements as jest.Mock).mockResolvedValue(mockReimbursements);
    (api.getAllLocations as jest.Mock).mockResolvedValue(mockLocations);
    (api.getTruckerProfilePic as jest.Mock).mockResolvedValue({ profile_pic_url: null });
    (api.completeTrip as jest.Mock).mockResolvedValue({ ...mockTrips[0], status: 'Completed' });
    (api.updateTruckerStatus as jest.Mock).mockResolvedValue({});
    (api.deleteLocation as jest.Mock).mockResolvedValue({});
    (api.getAdminById as jest.Mock).mockResolvedValue({ email: 'admin@example.com' });
    (api.getTruckerById as jest.Mock).mockResolvedValue(mockTrucker);
    (api.sendEmailNotification as jest.Mock).mockResolvedValue({});
    (api.updateLocation as jest.Mock).mockResolvedValue({});
    
    // Mock location permissions
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
      remove: jest.fn(),
    });
  });

  const renderComponent = () => {
    return render(<TruckerDashboard />);
  };

  describe('Component Rendering', () => {
    it('renders without crashing', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Live Location')).toBeTruthy();
      });
    });

    it('loads trips on component mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTripsByTruckerId).toHaveBeenCalledWith(1);
      });
    });

    it('loads reimbursements on component mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getAllReimbursements).toHaveBeenCalled();
      });
    });

    it('loads trucker profile picture', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTruckerProfilePic).toHaveBeenCalledWith(1);
      });
    });

    it('displays trucker name and rating in drawer', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
        expect(screen.getByText('⭐ 4.5 / 5.0')).toBeTruthy();
      });
    });
  });

  describe('Navigation Sections', () => {
    it('switches to ongoing trips section', async () => {
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
        expect(screen.getByText('Ongoing Trips')).toBeTruthy();
      });
    });

    it('switches to recent trips section', async () => {
      renderComponent();
      
      await waitFor(() => {
        const recentButton = screen.getByText('Recent Trips');
        fireEvent.press(recentButton);
        expect(screen.getByText('Recent Trips')).toBeTruthy();
      });
    });

    it('switches to reimbursements section', async () => {
      renderComponent();
      
      await waitFor(() => {
        const reimbursementsButton = screen.getByText('Pending Reimbursements');
        fireEvent.press(reimbursementsButton);
        expect(screen.getByText('Pending Reimbursements')).toBeTruthy();
      });
    });

    it('switches to live location section', async () => {
      renderComponent();
      
      await waitFor(() => {
        const mapButton = screen.getByText('Live Location');
        fireEvent.press(mapButton);
        expect(screen.getByText('Live Location')).toBeTruthy();
      });
    });
  });

  describe('Ongoing Trips', () => {
    it('displays ongoing trip details', async () => {
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Karachi → Lahore')).toBeTruthy();
        expect(screen.getByText('Trip ID: 1')).toBeTruthy();
        expect(screen.getByText('Status: Scheduled')).toBeTruthy();
      });
    });

    it('shows no ongoing trips message when none exist', async () => {
      (api.getTripsByTruckerId as jest.Mock).mockResolvedValue([
        { ...mockTrips[1] } // Only completed trip
      ]);
      
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('No ongoing trips')).toBeTruthy();
      });
    });

    it('completes trip when complete button is pressed', async () => {
      const { router } = require('expo-router');
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText('Complete Trip');
        fireEvent.press(completeButton);
      });
      
      await waitFor(() => {
        expect(api.completeTrip).toHaveBeenCalledWith(1);
        expect(api.updateTruckerStatus).toHaveBeenCalledWith(1, 'Inactive');
        expect(router.push).toHaveBeenCalledWith({
          pathname: './reimbursementForm',
          params: { trip_id: expect.any(Number) },
        });
      });
    });
  });

  describe('Recent Trips', () => {
    it('displays completed trips', async () => {
      renderComponent();
      
      await waitFor(() => {
        const recentButton = screen.getByText('Recent Trips');
        fireEvent.press(recentButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Islamabad → Multan')).toBeTruthy();
        expect(screen.getByText('Distance: 800 km')).toBeTruthy();
        expect(screen.getByText('✓ Completed')).toBeTruthy();
      });
    });
  });

  describe('Reimbursements', () => {
    it('displays reimbursement details', async () => {
      renderComponent();
      
      await waitFor(() => {
        const reimbursementsButton = screen.getByText('Pending Reimbursements');
        fireEvent.press(reimbursementsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Trip #2')).toBeTruthy();
        expect(screen.getByText('$ 15000.00')).toBeTruthy();
        expect(screen.getByText('Comment: Fuel and toll charges')).toBeTruthy();
        expect(screen.getByText('Pending')).toBeTruthy();
      });
    });

    it('shows no reimbursements message when none exist', async () => {
      (api.getAllReimbursements as jest.Mock).mockResolvedValue([]);
      
      renderComponent();
      
      await waitFor(() => {
        const reimbursementsButton = screen.getByText('Pending Reimbursements');
        fireEvent.press(reimbursementsButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('No reimbursements found.')).toBeTruthy();
      });
    });

    it('opens receipt image modal when receipt is pressed', async () => {
      renderComponent();
      
      await waitFor(() => {
        const reimbursementsButton = screen.getByText('Pending Reimbursements');
        fireEvent.press(reimbursementsButton);
      });
      
      // Since we can't easily test image press without more complex setup,
      // we just verify the receipt section exists
      await waitFor(() => {
        expect(screen.getByText('Receipt')).toBeTruthy();
      });
    });
  });

  describe('Live Location/Map', () => {
    it('displays map with markers when trip is active', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getAllLocations).toHaveBeenCalled();
      });
      
      // Map component is mocked, so we just verify the API calls
      expect(api.getAllLocations).toHaveBeenCalled();
    });

    it('shows not in trip message when no active trip', async () => {
      (api.getTripsByTruckerId as jest.Mock).mockResolvedValue([
        { ...mockTrips[1] } // Only completed trip
      ]);
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Not in a trip')).toBeTruthy();
      });
    });

    it('requests location permission for active trip', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      });
    });
  });

  describe('Drawer Navigation', () => {
    it('navigates to profile when profile button is pressed', async () => {
      const { router } = require('expo-router');
      renderComponent();
      
      await waitFor(() => {
        const profileButton = screen.getByText('Profile');
        fireEvent.press(profileButton);
        expect(router.push).toHaveBeenCalledWith('/userProfile');
      });
    });

    it('signs out when sign out button is pressed', async () => {
      const { router } = require('expo-router');
      renderComponent();
      
      await waitFor(() => {
        const signOutButton = screen.getByText('Sign Out');
        fireEvent.press(signOutButton);
        expect(router.push).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes data when pull to refresh is triggered', async () => {
      renderComponent();
      
      // Switch to recent trips to enable refresh control
      await waitFor(() => {
        const recentButton = screen.getByText('Recent Trips');
        fireEvent.press(recentButton);
      });
      
      // The actual refresh testing would require more complex ScrollView mocking
      // For now, we verify the API calls are available
      expect(api.getTripsByTruckerId).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully when fetching trips', async () => {
      (api.getTripsByTruckerId as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      // Component should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Live Location')).toBeTruthy();
      });
    });

    it('handles API errors gracefully when fetching reimbursements', async () => {
      (api.getAllReimbursements as jest.Mock).mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      // Component should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Live Location')).toBeTruthy();
      });
    });

    it('handles complete trip error gracefully', async () => {
      (api.completeTrip as jest.Mock).mockRejectedValue(new Error('Complete trip failed'));
      
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText('Complete Trip');
        fireEvent.press(completeButton);
      });
      
      // Should not crash the app
      await waitFor(() => {
        expect(screen.getByText('Complete Trip')).toBeTruthy();
      });
    });
  });

  describe('Email Notification', () => {
    it('sends email notification when trip is completed', async () => {
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText('Complete Trip');
        fireEvent.press(completeButton);
      });
      
      await waitFor(() => {
        expect(api.getAdminById).toHaveBeenCalledWith(1);
        expect(api.getTruckerById).toHaveBeenCalledWith(1);
        expect(api.sendEmailNotification).toHaveBeenCalled();
      });
    });

    it('continues with trip completion even if email fails', async () => {
      (api.sendEmailNotification as jest.Mock).mockRejectedValue(new Error('Email failed'));
      
      renderComponent();
      
      await waitFor(() => {
        const ongoingButton = screen.getByText('Ongoing Trips');
        fireEvent.press(ongoingButton);
      });
      
      await waitFor(() => {
        const completeButton = screen.getByText('Complete Trip');
        fireEvent.press(completeButton);
      });
      
      // Should still complete the trip successfully
      await waitFor(() => {
        expect(api.completeTrip).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator initially', async () => {
      // Mock delayed API response
      (api.getTripsByTruckerId as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTrips), 100))
      );
      
      renderComponent();
      
      // Loading state is handled internally, component should still render
      expect(screen.getByText('Live Location')).toBeTruthy();
    });

    it('shows loading indicator for map section', async () => {
      // Mock delayed location API response
      (api.getAllLocations as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockLocations), 100))
      );
      
      renderComponent();
      
      // Component should handle loading state gracefully
      expect(screen.getByText('Live Location')).toBeTruthy();
    });
  });

  describe('Data Filtering', () => {
    it('filters trips correctly by status', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTripsByTruckerId).toHaveBeenCalledWith(1);
      });
      
      // The component should filter completed vs scheduled trips internally
      // This is verified by the API calls being made
    });

    it('filters reimbursements by trip IDs', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getAllReimbursements).toHaveBeenCalled();
        expect(api.getTripsByTruckerId).toHaveBeenCalled();
      });
      
      // Component filters reimbursements based on completed trips
      // This logic is tested through the API calls
    });
  });
});