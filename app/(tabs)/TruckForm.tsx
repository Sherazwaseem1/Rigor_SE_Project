import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { useThemeColor } from '../../hooks/useThemeColor';

interface TruckFormData {
  truck_id: string;
  license_plate: string;
  chassis_number: string;
  capacity: string;
  assigned_trucker_id?: string;
}

interface ValidationErrors {
  truck_id?: string;
  license_plate?: string;
  chassis_number?: string;
  capacity?: string;
  assigned_trucker_id?: string;
}

export default function TruckForm() {
  const backgroundColor = useThemeColor('background');
  const textColor = useThemeColor('text');

  const [formData, setFormData] = useState<TruckFormData>({
    truck_id: '',
    license_plate: '',
    chassis_number: '',
    capacity: '',
    assigned_trucker_id: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate truck_id (must be a positive integer)
    if (!formData.truck_id) {
      newErrors.truck_id = 'Truck ID is required';
    } else if (!/^\d+$/.test(formData.truck_id)) {
      newErrors.truck_id = 'Truck ID must be a positive integer';
    }

    // Validate license_plate (required, non-empty string)
    if (!formData.license_plate.trim()) {
      newErrors.license_plate = 'License plate is required';
    }

    // Validate chassis_number (required, non-empty string)
    if (!formData.chassis_number.trim()) {
      newErrors.chassis_number = 'Chassis number is required';
    }

    // Validate capacity (must be a positive integer)
    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (!/^\d+$/.test(formData.capacity)) {
      newErrors.capacity = 'Capacity must be a positive integer';
    }

    // Validate assigned_trucker_id (optional, but if provided must be a positive integer)
    if (formData.assigned_trucker_id && !/^\d*$/.test(formData.assigned_trucker_id)) {
      newErrors.assigned_trucker_id = 'Assigned trucker ID must be a positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Convert string values to appropriate types for API
      const submissionData = {
        truck_id: parseInt(formData.truck_id),
        license_plate: formData.license_plate,
        chassis_number: formData.chassis_number,
        capacity: parseInt(formData.capacity),
        ...(formData.assigned_trucker_id
          ? { assigned_trucker_id: parseInt(formData.assigned_trucker_id) }
          : {}),
      };
      console.log('Form data to submit:', submissionData);
      // TODO: Add API call to submit data
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Link href="../" style={styles.backButton}>
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron.left" color="#333" />
            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
          </View>
        </Link>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/rigor_no_bg.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.title, { color: '#202545' }]}>Add New Truck</Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: '#202545' }]}>Truck ID*</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formData.truck_id}
          onChangeText={(text) => setFormData({ ...formData, truck_id: text })}
          keyboardType="numeric"
          placeholder="Enter truck ID"
          placeholderTextColor="#666"
        />
        {errors.truck_id && <Text style={styles.errorText}>{errors.truck_id}</Text>}

        <Text style={[styles.label, { color: '#202545' }]}>License Plate*</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formData.license_plate}
          onChangeText={(text) => setFormData({ ...formData, license_plate: text })}
          placeholder="Enter license plate"
          placeholderTextColor="#666"
        />
        {errors.license_plate && <Text style={styles.errorText}>{errors.license_plate}</Text>}

        <Text style={[styles.label, { color: '#202545' }]}>Chassis Number*</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formData.chassis_number}
          onChangeText={(text) => setFormData({ ...formData, chassis_number: text })}
          placeholder="Enter chassis number"
          placeholderTextColor="#666"
        />
        {errors.chassis_number && <Text style={styles.errorText}>{errors.chassis_number}</Text>}

        <Text style={[styles.label, { color: '#202545' }]}>Capacity*</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formData.capacity}
          onChangeText={(text) => setFormData({ ...formData, capacity: text })}
          keyboardType="numeric"
          placeholder="Enter capacity"
          placeholderTextColor="#666"
        />
        {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}

        <Text style={[styles.label, { color: '#202545' }]}>Assigned Trucker ID</Text>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formData.assigned_trucker_id}
          onChangeText={(text) => setFormData({ ...formData, assigned_trucker_id: text })}
          keyboardType="numeric"
          placeholder="Enter assigned trucker ID (optional)"
          placeholderTextColor="#666"
        />
        {errors.assigned_trucker_id && <Text style={styles.errorText}>{errors.assigned_trucker_id}</Text>}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Math.max(screenHeight * 0.03, 24),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  header: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Math.max(screenHeight * 0.02, 16),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  logo: {
    width: Math.min(Math.max(screenWidth * 0.25, 100), 140),
    height: Math.min(Math.max(screenWidth * 0.25, 100), 140),
    resizeMode: 'contain',
  },
  title: {
    fontSize: Math.min(Math.max(screenWidth * 0.06, 20), 24),
    fontWeight: 'bold',
    marginBottom: Math.max(screenHeight * 0.02, 16),
    textAlign: 'center',
    color: '#202545',
  },
  inputContainer: {
    flex: 1,
    marginBottom: Math.max(screenHeight * 0.02, 16),
    paddingHorizontal: Math.max(screenWidth * 0.03, 12),
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.038, 14), 16),
    marginBottom: Math.max(screenHeight * 0.008, 6),
    color: '#202545',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
    padding: Math.max(screenWidth * 0.025, 10),
    marginBottom: Math.max(screenHeight * 0.012, 10),
    fontSize: Math.min(Math.max(screenWidth * 0.038, 14), 16),
    width: '100%',
  },
  errorText: {
    color: '#ff0000',
    fontSize: Math.min(Math.max(screenWidth * 0.035, 12), 14),
    marginBottom: Math.max(screenHeight * 0.01, 8),
  },
  submitButton: {
    backgroundColor: '#7F9FB4',
    paddingVertical: Math.max(screenHeight * 0.012, 10),
    borderRadius: Math.min(Math.max(screenWidth * 0.02, 8), 12),
    alignItems: 'center',
    marginTop: Math.max(screenHeight * 0.02, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    marginHorizontal: Math.max(screenWidth * 0.03, 12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: Math.max(screenWidth * 0.03, 12),
  },
  submitButtonText: {
    color: '#202545',
    fontSize: Math.min(Math.max(screenWidth * 0.045, 16), 18),
    fontWeight: 'bold',
  },
});