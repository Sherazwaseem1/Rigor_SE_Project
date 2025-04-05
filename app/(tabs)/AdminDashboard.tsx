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
} from "../../services/api";
import { router } from 'expo-router'

const AdminDashboard = () => {
  const admin = useSelector((state: RootState) => state.user);

  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [pendingReimbursements, setPendingReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getAllTrips();
        const truckersData = await getAllTruckers();
        const reimbursementsData = await getAllReimbursements();

        setActiveTrips(tripsData);
        setTruckers(truckersData);
        setPendingReimbursements(reimbursementsData.filter(r => r.status === "Pending"));
          
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007bff" />;

  return (
    <ScrollView style={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.header}>Welcome, {admin.name} 👋</Text>
      </View>

      {/* Active Trips Section */}
      <Text style={styles.sectionTitle}>Ongoing Trips</Text>
      <FlatList
        data={activeTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.tripCard]}>
            <View style={styles.tripHeader}>
              <Text style={styles.tripRoute}>{item.start_location} → {item.end_location}</Text>
              <Text style={styles.tripTime}>12:00</Text>
            </View>
            <View>
              <Text style={styles.tripDriver}>{item.trucker_name || 'Driver Name'}</Text>
              <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
              <Text style={styles.cardText}>📍 Start: {item.start_location}</Text>
              <Text style={styles.cardText}>🏁 End: {item.end_location}</Text>
              <Text style={[styles.cardText, styles.statusText]}>Status: {item.status}</Text>
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
            <Text style={[styles.cardText, styles.statusText]}>Status: {item.status}</Text>
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
          <View style={styles.button}>
            <Button title="Go to Profile" color="#7F9FB4" onPress={() => router.push("/UserProfileTest")} />
          </View>
          <View style={[styles.button, styles.signoutButton]}>
            <Button title="Sign Out" color="#7F9FB4" onPress={() => router.push("/")} />
          </View>
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
    backgroundColor: '#202545',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 25,
    marginBottom: 15,
    color: '#202545',
    textAlign: 'left',
    paddingHorizontal: 10,
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
    color: '#1a237e',
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
  },
  button: {
    backgroundColor: '#7F9FB4',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  signoutButton: {
    backgroundColor: '#7F9FB4',
  },
});

export default AdminDashboard;
