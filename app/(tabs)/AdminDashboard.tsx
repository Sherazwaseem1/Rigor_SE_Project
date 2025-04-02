import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
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
          
        console.log(reimbursementsData)
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
      <Text style={styles.sectionTitle}>🚛 Active Trips</Text>
      <FlatList
        data={activeTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.tripCard]}>
            <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
            <Text style={styles.cardText}>📍 Start: {item.start_location}</Text>
            <Text style={styles.cardText}>🏁 End: {item.end_location}</Text>
            <Text style={[styles.cardText, styles.statusText]}>Status: {item.status}</Text>
          </View>
        )}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e3f2fd", // Light blue background
    padding: 15,
  },
  welcomeContainer: {
    backgroundColor: "#0d47a1", // Dark blue
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#0d47a1", // Dark blue
    textAlign: 'center', // Center the headings
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 10, // Ensures the cards don't extend too far right
  },
  tripCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#ff9800", // Orange for trips
  },
  reimbursementCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4caf50", // Green for reimbursements
  },
  truckerCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#2196f3", // Blue for truckers
  },
  placeholderCard: {
    backgroundColor: "#cfd8dc", // Grey for placeholder
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  statusText: {
    fontWeight: "bold",
    color: "#d32f2f", // Red for status
  },
  ratingText: {
    fontWeight: "bold",
    color: "#ff9800", // Orange for rating
  },
});

export default AdminDashboard;
