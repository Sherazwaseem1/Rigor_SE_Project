import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Button,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  getTripsByTruckerId,
  getReimbursementsByTripId,
  getTruckerByEmail,
  updateLocation,
  Trip,
  Reimbursement,
} from "../../services/api";

import { router } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import * as Location from "expo-location";

const TruckerDashboard = () => {
  const trucker = useSelector((state: RootState) => state.user);

  const [rating, setRating] = useState<number>(0);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<
    Reimbursement[]
  >([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter(
          (trip) => trip.status === "Completed"
        );
        const activeTrip = tripsData.find(
          (trip) => trip.status === "Scheduled"
        );

        const truckerData = await getTruckerByEmail(trucker.email);
        setRating(truckerData.rating || 0);

        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);

        const reimbursements = await Promise.all(
          tripsData.map((trip) => getReimbursementsByTripId(trip.trip_id))
        );
        setPendingReimbursements(
          reimbursements.flat().filter((r) => r.status === "Pending")
        );
      } catch (error) {
        // console.error("Error fetching trucker dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    if (ongoingTrip) {
      const interval = setInterval(async () => {
        try {
          // Fetch current location using Expo Location API
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            console.error("Permission to access location was denied");
            return;
          }

          const location = await Location.getCurrentPositionAsync({});
          const currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          await updateLocation(ongoingTrip.trip_id, {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            timestamp: new Date(),
          });
        } catch (error) {
          console.error("Error updating location:", error);
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [ongoingTrip]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={pastTrips}
        keyExtractor={(trip) => trip.trip_id.toString()}
        renderItem={() => null} // ✅ Fix: required prop, dummy renderer
        ListHeaderComponent={() => (
          <View style={styles.container}>
            {/* Welcome Section */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.header}>Welcome, {trucker.name}</Text>
            </View>

            {/* Ongoing Trip Section */}
            <Text style={styles.sectionTitle}>🚛 Ongoing Trip</Text>
            {ongoingTrip ? (
              <View style={[styles.card, styles.tripCard]}>
                <Text style={styles.cardText}>
                  Trip ID: {ongoingTrip.trip_id}
                </Text>
                <Text style={styles.cardText}>
                  📍 Start: {ongoingTrip.start_location}
                </Text>
                <Text style={styles.cardText}>
                  🏁 End: {ongoingTrip.end_location}
                </Text>
                <Text
                  style={[
                    styles.cardText,
                    styles.statusText,
                    {
                      color:
                        ongoingTrip.status === "Completed"
                          ? "#4CAF50"
                          : "#202545",
                    },
                  ]}
                >
                  Status: {ongoingTrip.status}
                </Text>
              </View>
            ) : (
              <View style={[styles.card, styles.placeholderCard]}>
                <Text style={styles.cardText}>No ongoing trips.</Text>
              </View>
            )}

            {/* Recent Trips Section */}
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            {pastTrips.length > 0 ? (
              pastTrips.map((item) => (
                <View style={[styles.card, styles.tripCard]} key={item.trip_id}>
                  <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
                  <Text style={styles.cardText}>
                    📍 Start: {item.start_location}
                  </Text>
                  <Text style={styles.cardText}>
                    🏁 End: {item.end_location}
                  </Text>
                  <Text
                    style={[
                      styles.cardText,
                      styles.statusText,
                      {
                        color:
                          item.status === "Completed" ? "#4CAF50" : "#202545",
                      },
                    ]}
                  >
                    Status: {item.status}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.card, styles.placeholderCard]}>
                <Text style={styles.cardText}>No recent trips available.</Text>
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
                  <View
                    style={[styles.card, styles.reimbursementCard]}
                    key={item.reimbursement_id}
                  >
                    <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
                    <Text style={styles.cardText}>
                      💵 Amount: $
                      {parseFloat(item.amount.$numberDecimal).toFixed(2)}
                    </Text>
                    <Text
                      style={[
                        styles.cardText,
                        styles.statusText,
                        {
                          color:
                            item.status === "Completed" ? "#4CAF50" : "#202545",
                        },
                      ]}
                    >
                      Status: {item.status}
                    </Text>
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
              <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/UserProfileTest")}
              >
                <Text style={styles.buttonText}>Go to Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.signoutButton]}
                onPress={() => router.push("/")}
              >
                <Text style={styles.signoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Reimbursement Form"
                onPress={() => router.push("/Reimbursement_form")}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  welcomeContainer: {
    backgroundColor: "#F5F7FA",
    padding: 35,
    borderRadius: 28,
    marginVertical: 35,
    marginHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "solid",
  },
  header: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2D3748",
    letterSpacing: 1.5,
    textShadowColor: "rgba(0, 0, 0, 0.12)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
    color: "#ffffff",
    textAlign: "left",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#202545",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    textTransform: "capitalize",
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    gap: 12,
  },
  button: {
    backgroundColor: "#7F9FB4",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    minWidth: 200,
  },
  buttonText: {
    color: "#202545",
    fontWeight: "bold",
    fontSize: 16,
  },
  signoutButton: {
    backgroundColor: "#9B403D",
  },
  signoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
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