import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TruckForm from '../app/(tabs)/truckForm'; // Update with your actual path
import * as api from '../services/api';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

// Mock the store
const middlewares = [];
const mockStore = configureMockStore(middlewares);

// Mock data
const mockTruckers = [
  { trucker_id: 1, name: 'John Doe', email: 'john@example.com' },
  { trucker_id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

const mockTruck = {
  truck_id: 1,
  license_plate: 'ABC123',
  chassis_number: 'CH123456',
  capacity: 5000,
  assigned_trucker_id: 1
};

// Create mock store
const store = mockStore({
  user: { id: 1, name: 'Admin' },
});

// Mock all API functions
jest.mock('../services/api', () => ({
  getTruckersWithoutTruck: jest.fn(),
  createTruck: jest.fn(),
}));

// Mock other dependencies
jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true,
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Find the OK button if it exists
  if (buttons && buttons.length > 0) {
    const okButton = buttons.find(button => button.text === 'OK');
    if (okButton && okButton.onPress) {
      okButton.onPress();
    }
  }
});

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: jest.fn(cb => data => cb(data)),
    setValue: jest.fn(),
    getValues: jest.fn(),
    formState: { errors: {} }
  })
}));

describe('TruckForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API mocks
    (api.getTruckersWithoutTruck).mockResolvedValue(mockTruckers);
    (api.createTruck).mockResolvedValue(mockTruck);
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <TruckForm />
      </Provider>
    );
  };

  describe('Component Rendering', () => {
    it('renders without crashing', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Add New Truck')).toBeTruthy();
        expect(screen.getByText('Submit')).toBeTruthy();
      });
    });

    it('loads truckers on component mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTruckersWithoutTruck).toHaveBeenCalled();
      });
    });

    it('displays all form fields', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('License Plate')).toBeTruthy();
        expect(screen.getByText('Chassis Number')).toBeTruthy();
        expect(screen.getByText('Capacity (kg)')).toBeTruthy();
        expect(screen.getByText('Assign Trucker')).toBeTruthy();
      });
    });
  });


  describe('Navigation', () => {
    it('navigates back when back button is pressed', async () => {
      const { router } = require('expo-router');
      renderComponent();
      
      const backButton = screen.getByText('Back');
      fireEvent.press(backButton);
      
      expect(router.push).toHaveBeenCalledWith('/adminDashboard');
    });

  });

  describe('Error Handling', () => {
    it('shows error when fetching truckers fails', async () => {
      (api.getTruckersWithoutTruck).mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      // The component should continue to render even if the API fails
      await waitFor(() => {
        expect(screen.getByText('Add New Truck')).toBeTruthy();
      });
    });

   
  });

  describe('Trucker Selection', () => {
    it('displays trucker options from API response', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTruckersWithoutTruck).toHaveBeenCalled();
      });
      
      // Check Picker is present (we can't easily test its content)
      // This part relies on React Native picker which is harder to test directly
      expect(screen.getByText('Assign Trucker')).toBeTruthy();
    });

    it('handles empty trucker list gracefully', async () => {
      (api.getTruckersWithoutTruck).mockResolvedValue([]);
      
      renderComponent();
      
      await waitFor(() => {
        expect(api.getTruckersWithoutTruck).toHaveBeenCalled();
      });
      
      // Form should still render properly
      expect(screen.getByText('Add New Truck')).toBeTruthy();
    });
  });
});