import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Button,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  getAllTrips,
  getAllTruckers,
  getAllReimbursements,
  Trip,
  Trucker,
  Reimbursement,
  getTruckerById
} from "../../services/api";
import { router } from 'expo-router'
import { TouchableOpacity } from "react-native";
import { useIsFocused } from "@react-navigation/native";


const AdminDashboard = () => {
  const admin = useSelector((state: RootState) => state.user);

  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [pendingReimbursements, setPendingReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getAllTrips();
        const truckersData = await getAllTruckers();
        const reimbursementsData = await getAllReimbursements();

          // Fetch trucker names for trips
        const tripsWithTruckerNames = await Promise.all(
          tripsData.map(async (trip) => {
            const trucker = await getTruckerById(trip.trucker_id);
            return { ...trip, trucker_name: trucker.name };
          })
        );

        setActiveTrips(tripsWithTruckerNames);
        

        // setActiveTrips(tripsData);
        setTruckers(truckersData);
        setPendingReimbursements(reimbursementsData.filter(r => r.status === "Pending"));
          
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" />;

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.header}>Welcome, {admin.name}!</Text>
      </View>

      {/* Active Trips Section */}
      <Text style={styles.sectionTitle}>🚛 Ongoing Trips</Text>
      <FlatList
        data={activeTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        renderItem={({ item }) => item.status === "Scheduled" && (
          <View style={[styles.card, styles.tripCard]}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripRoute}>{item.start_location} → {item.end_location}</Text>
              {/* <Text style={styles.tripTime}>12:00</Text> */}
            </View>
            <View>
              <Text style={styles.tripDriver}>{item.trucker_name || 'Driver Name'}</Text>
              <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
              <Text style={styles.cardText}>📍 Start: {item.start_location}</Text>
              <Text style={styles.cardText}>🏁 End: {item.end_location}</Text>
              <Text style={[styles.cardText, styles.statusText, { color: item.status === 'Completed' ? '#4CAF50' : item.status === 'Scheduled' ? '#9B403D' : '#202545' }]}>Status: {item.status}</Text>
            </View>
          </View>
        )}
        style={styles.tripList}
      />

      <Text style={styles.sectionTitle}>🚛 Recent Trips</Text>
      <FlatList
        data={activeTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        renderItem={({ item }) => item.status === "Completed" && (
          <View style={[styles.card, styles.tripCard]}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripRoute}>{item.start_location} → {item.end_location}</Text>
              {/* <Text style={styles.tripTime}>12:00</Text> */}
            </View>
            <View>
              <Text style={styles.tripDriver}>{item.trucker_name || 'Driver Name'}</Text>
              <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
              <Text style={styles.cardText}>📍 Start: {item.start_location}</Text>
              <Text style={styles.cardText}>🏁 End: {item.end_location}</Text>
              <Text style={[styles.cardText, styles.statusText, { color: item.status === 'Completed' ? '#4CAF50' : item.status === 'Scheduled' ? '#9B403D' : '#202545' }]}>Status: {item.status}</Text>
            </View>
          </View>
        )}
        style={styles.tripList}
      />

      {/* Live Truck Locations Placeholder */}
      <Text style={styles.sectionTitle}>📍 Live Truck Locations</Text>
      <View style={[styles.card, styles.placeholderCard]}>
        <Text style={styles.cardText}>Live Truck Locations will be implemented soon...</Text>
      </View>

      {/* Pending Reimbursements */}
      <Text style={styles.sectionTitle}>💰 Pending Reimbursements</Text>
      <FlatList
        data={pendingReimbursements}
        keyExtractor={(item) => item.reimbursement_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.reimbursementCard]}>
            <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
            <Text style={styles.cardText}>
              💵 Amount: ${parseFloat(item.amount.$numberDecimal).toFixed(2)} {/* Fixing NaN issue */}
            </Text>
            <Text style={[styles.cardText, styles.statusText, { color: item.status === 'Completed' ? '#4CAF50' : item.status === 'Pending' ? '#9B403D' : '#202545' }]}>Status: {item.status}</Text>
          </View>
        )}
      />

      {/* Truckers List */}
      <Text style={styles.sectionTitle}>🚚 Registered Truckers</Text>
      <FlatList
        data={truckers}
        keyExtractor={(trucker) => trucker.trucker_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.truckerCard]}>
            <Text style={styles.cardText}>👤 Name: {item.name}</Text>
            <Text style={styles.cardText}>📞 Phone: {item.phone_number}</Text>
            <Text style={styles.cardText}>✉️ Email: {item.email}</Text>
            <Text style={[styles.cardText, styles.ratingText]}>⭐ Rating: {item.rating}</Text>
          </View>
        )}
      />

      {/* Profile Navigation Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/UserProfileTest")}>
          <Text style={styles.buttonText}>Go to Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button]} onPress={() => router.push("/TripAssignmentFrom")}>
          <Text style={styles.signoutButtonText}>Assign Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button]} onPress={() => router.push("/TruckForm")}>
          <Text style={styles.signoutButtonText}>Add Truck</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.signoutButton]} onPress={() => router.push("/")}>
          <Text style={styles.signoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  welcomeContainer: {
    backgroundColor: '#F5F7FA',
    padding: 35,
    borderRadius: 28,
    marginVertical: 35,
    marginHorizontal: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'solid',
  },
  header: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#ffffff',
    textAlign: 'left',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#202545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    textTransform: 'capitalize',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tripList: {
    paddingHorizontal: 5,
  },
  tripCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripRoute: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a237e',
    letterSpacing: 0.2,
  },
  tripTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d32f2f',
  },
  tripDriver: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  reimbursementCard: {
    borderLeftWidth: 0,
    borderRadius: 12,
  },
  truckerCard: {
    borderLeftWidth: 0,
    borderRadius: 12,
  },
  placeholderCard: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#202545',
    fontWeight: '500',
  },
  statusText: {
    fontWeight: '600',
    color: '#202545',
    fontSize: 15,
  },
  ratingText: {
    fontWeight: '600',
    color: '#ffa000',
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 25,
    marginBottom: 15,
    alignSelf: 'center',
    width: '90%',
    gap: 12,
    padding: 10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#7F9FB4',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202545'
  },
  signoutButton: {
    backgroundColor: '#9B403D',
  },
  signoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboard;
