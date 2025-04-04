import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Button,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  getTripsByTruckerId,
  getReimbursementsByTripId,
  getTruckerByEmail,
  Trip,
  Reimbursement,
} from "../../services/api";

import { router } from 'expo-router';

const TruckerDashboard = () => {
  const trucker = useSelector((state: RootState) => state.user);

  const [rating, setRating] = useState<number>(0);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter(trip => trip.status === "Completed");
        const activeTrip = tripsData.find(trip => trip.status === "Ongoing");
        
        const truckerData = await getTruckerByEmail(trucker.email);
        setRating(truckerData.rating || 0);

        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);

        const reimbursements = await Promise.all(
          tripsData.map(trip => getReimbursementsByTripId(trip.trip_id))
        );
        setPendingReimbursements(reimbursements.flat().filter(r => r.status === "Pending"));
      } catch (error) {
        console.error("Error fetching trucker dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#007bff" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={pastTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        ListHeaderComponent={() => (
          <View style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.header}>Welcome, {trucker.name} 👋</Text>
            </View>

            {/* Ongoing Trip Section */}
            <Text style={styles.sectionTitle}>🚛 Ongoing Trip</Text>
            {ongoingTrip ? (
              <View style={[styles.card, styles.tripCard]}>
                <Text style={styles.cardText}>Trip ID: {ongoingTrip.trip_id}</Text>
                <Text style={styles.cardText}>📍 Start: {ongoingTrip.start_location}</Text>
                <Text style={styles.cardText}>🏁 End: {ongoingTrip.end_location}</Text>
                <Text style={[styles.cardText, styles.statusText]}>Status: {ongoingTrip.status}</Text>
              </View>
            ) : (
              <View style={[styles.card, styles.placeholderCard]}>
                <Text style={styles.cardText}>No ongoing trips.</Text>
              </View>
            )}

            {/* Current Location Section (Placeholder) */}
            <Text style={styles.sectionTitle}>📍 Current Location</Text>
            <View style={[styles.card, styles.locationCard]} />

            {/* Pending Reimbursements */}
            <Text style={styles.sectionTitle}>💰 Pending Reimbursements</Text>
            {pendingReimbursements.length === 0 ? (
              <Text style={styles.cardText}>No pending reimbursements.</Text>
            ) : (
              <View>
                {pendingReimbursements.map((item) => (
                  <View style={[styles.card, styles.reimbursementCard]} key={item.reimbursement_id}>
                    <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
                    <Text style={styles.cardText}>
                      💵 Amount: ${parseFloat(item.amount.$numberDecimal).toFixed(2)}
                    </Text>
                    <Text style={[styles.cardText, styles.statusText]}>Status: {item.status}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Trucker Rating Section */}
            <Text style={styles.sectionTitle}>⭐ Your Rating</Text>
            <View style={[styles.card, styles.ratingCard]}>
              <Text style={styles.ratingText}>{rating.toFixed(1)} / 5</Text>
            </View>

            {/* Profile Navigation Button */}
            <View style={styles.buttonContainer}>
              <Button title="Go to Profile" onPress={() => router.push("/UserProfileTest")} />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Signout" onPress={() => router.push("/")} />
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.tripCard]}>
            <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
            <Text style={styles.cardText}>📍 Start: {item.start_location}</Text>
            <Text style={styles.cardText}>🏁 End: {item.end_location}</Text>
            <Text style={[styles.cardText, styles.statusText]}>Status: {item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e3f2fd",
  },
  container: {
    flex: 1,
    backgroundColor: "#e3f2fd",
    padding: 15,
  },
  welcomeContainer: {
    backgroundColor: "#0d47a1",
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
    color: "#0d47a1",
    textAlign: "center",
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
    marginHorizontal: 10,
  },
  tripCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#ff9800",
  },
  reimbursementCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#4caf50",
  },
  ratingCard: {
    alignItems: "center",
    padding: 20,
  },
  locationCard: {
    backgroundColor: "#000",
    height: 150,
    borderRadius: 10,
  },
  placeholderCard: {
    backgroundColor: "#cfd8dc",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: "center",
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  statusText: {
    fontWeight: "bold",
    color: "#d32f2f",
  },
  ratingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ff9800",
  },
});

export default TruckerDashboard;