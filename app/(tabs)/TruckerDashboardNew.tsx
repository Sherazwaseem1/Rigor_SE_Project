import React, { useEffect, useState, useRef } from "react";
import styles from '../../assets/styles/styleTruckerDashboardNew';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { Drawer } from "react-native-drawer-layout";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

import {
  getTripsByTruckerId,
  getTruckerByEmail,
  getReimbursementsByTripId,
  getAllLocations,
  updateLocation,
  completeTrip,
  deleteLocation,
  getTruckerProfilePic,
  updateTruckerStatus,
  getAdminById,
  getTruckerById,
  sendEmailNotification,
} from "../../services/api";

import { RootState } from "../../redux/store";
import { Trip, Reimbursement } from "../../services/util";

import { useDispatch } from "react-redux";
import { resetUser } from "../../redux/slices/userSlice";
import { persistor } from "../../redux/store";
import { Image, RefreshControl } from "react-native";

const truckerDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const trucker = useSelector((state: RootState) => state.user);
  const isFocused = useIsFocused();
  const [rating, setRating] = useState<number>(0);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<
    Reimbursement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState<
    "map" | "ongoing" | "recent" | "reimbursements"
  >("map"); 

  const [locations, setLocations] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const locationIdRef = useRef<number | null>(null);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const firstLocLoad = useRef(true);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter(
          (t) => t.status === "Completed"
        );
        const activeTrip = tripsData.find((t) => t.status === "Scheduled");

        const truckerData = await getTruckerByEmail(trucker.email);

        const profilePicResponse = await getTruckerProfilePic(trucker.id);
        setProfilePicUrl(profilePicResponse?.profile_pic_url || null);

        setRating(truckerData.rating || 0);

        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);

        const reimbursements = await Promise.all(
          tripsData.map((t) => getReimbursementsByTripId(t.trip_id))
        );
        setPendingReimbursements(
          reimbursements.flat().filter((r) => r.status === "Pending")
        );
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (activeSection !== "map") return;
      if (!ongoingTrip) {
        setLocations([]);
        if (firstLocLoad.current) setLocLoading(false);
        return;
      }
      if (firstLocLoad.current) setLocLoading(true);

      try {
        const allLocs = await getAllLocations();
        const tripLoc = allLocs.filter(
          (l) => l.trip_id === ongoingTrip.trip_id
        );
        setLocations(tripLoc);
        if (tripLoc.length) locationIdRef.current = tripLoc[0].location_id;
      } catch (err) {
        setLocations([]);
      } finally {
        if (firstLocLoad.current) {
          setLocLoading(false);
          firstLocLoad.current = false;
        }
      }
    };

    fetchLocations();
    const interval = setInterval(fetchLocations, 15000);
    return () => clearInterval(interval);
  }, [activeSection, ongoingTrip, isFocused]);

  useEffect(() => {
    const startWatching = async () => {
      if (!ongoingTrip || activeSection !== "map") return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      watchSubRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (pos) => {
          setLocations((prev) => {
            if (!prev.length) return prev;
            const latest = prev[0];
            const updated = {
              ...latest,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              timestamp: new Date().toISOString(),
            };
            return [updated, ...prev.slice(1)];
          });

          if (locationIdRef.current) {
            try {
              await updateLocation(locationIdRef.current, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp: new Date(),
              });
            } catch (err) {
            }
          }
        }
      );
    };

    startWatching();

    return () => {
      if (watchSubRef.current) {
        watchSubRef.current.remove();
        watchSubRef.current = null;
      }
    };
  }, [ongoingTrip, activeSection]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeSection === "map") {
        if (!ongoingTrip) {
          setLocations([]);
          return;
        }
        const allLocs = await getAllLocations();
        const tripLoc = allLocs.filter((l) => l.trip_id === ongoingTrip.trip_id);
        setLocations(tripLoc);
      } else if (activeSection === "ongoing" || activeSection === "recent" || activeSection === "reimbursements") {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter((t) => t.status === "Completed");
        const activeTrip = tripsData.find((t) => t.status === "Scheduled");
  
        const reimbursements = await Promise.all(
          tripsData.map((t) => getReimbursementsByTripId(t.trip_id))
        );
  
        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);
        setPendingReimbursements(
          reimbursements.flat().filter((r) => r.status === "Pending")
        );
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = () => {
    dispatch(resetUser());
    persistor.purge();
  };

  const renderDrawerContent = () => (
    <View style={styles.drawerContent}>
      <View style={styles.profileSection}>
        {profilePicUrl ? (
          <View style={styles.profileImageWrapper}>
            <Image
              source={{ uri: profilePicUrl }}
              style={styles.profileImage}
            />
          </View>
        ) : (
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>{trucker.name[0]}</Text>
          </View>
        )}
        <Text style={styles.profileName}>{trucker.name}</Text>
        <Text style={styles.role}>⭐ {rating.toFixed(1)} / 5.0</Text>
      </View>

      {["map", "ongoing", "recent", "reimbursements"].map((section) => (
        <TouchableOpacity
          key={section}
          style={[
            styles.drawerItem,
            activeSection === section && styles.activeDrawerItem,
          ]}
          onPress={() => {
            setActiveSection(section);
            setIsDrawerOpen(false);
          }}
        >
          <Text style={styles.drawerItemText}>
            {section === "map"
              ? "Live Location"
              : section === "ongoing"
              ? "Ongoing Trips"
              : section === "recent"
              ? "Recent Trips"
              : "Pending Reimbursements"}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push("/userProfile")}
      >
        <Text style={styles.drawerItemText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.drawerItem, styles.signOutItem]}
        onPress={() => {
          handleSignOut();
          router.push("/");
        }}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading)
      return (
        <ActivityIndicator
          size="large"
          color="#088395"
          style={styles.loaderContainer}
        />
      );

    switch (activeSection) {
      case "map":
        if (locLoading)
          return (
            <ActivityIndicator
              size="large"
              color="#088395"
              style={styles.loaderContainer}
            />
          );
        if (!ongoingTrip || locations.length === 0) {
          return (
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 30.3753,
                  longitude: 69.3451,
                  latitudeDelta: 15,
                  longitudeDelta: 15,
                }}
              />
              <View style={styles.noTripsBanner}>
                <Text style={styles.noTripsText}>Not in a trip</Text>
              </View>
            </View>
          );
        }
        return (
          <MapView style={styles.map}>
            {locations.map((loc) => (
              <Marker
                key={loc.location_id}
                coordinate={{
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }}
                title={`Trip #${loc.trip_id}`}
                description={new Date(loc.timestamp).toLocaleString()}
              />
            ))}
          </MapView>
        );

      case "ongoing":
        if (!ongoingTrip)
          return (
            <View style={styles.contentWrapper}>
              <Text style={styles.noContentText}>No ongoing trips</Text>
            </View>
          );
        return (
          <View style={styles.contentWrapper}>
            <View style={styles.card}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripRoute}>
                  {ongoingTrip.start_location} → {ongoingTrip.end_location}
                </Text>
              </View>
              <View style={styles.tripDetails}>
                <Text style={styles.cardText}>Trip ID: {ongoingTrip.trip_id}</Text>
                <Text style={styles.cardText}>Start: {ongoingTrip.start_location}</Text>
                <Text style={styles.cardText}>End: {ongoingTrip.end_location}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Status: {ongoingTrip.status}</Text>
                </View>
                <TouchableOpacity
                  style={styles.completeBtn}
                  onPress={async () => {
                    try {
                      console.log("Completing")
                      const updated = await completeTrip(ongoingTrip.trip_id);
                      const updatedStatus = "Inactive"; 
                      const updateResponse = await updateTruckerStatus(ongoingTrip.trucker_id, updatedStatus);
                      if (locationIdRef.current)
                        await deleteLocation(locationIdRef.current);

                      setLocations([]);
                      setOngoingTrip(null);
                      setPastTrips((prev) => [updated, ...prev]);

                      // ✉️ Send email to the admin
                      try {
                        const adminData = await getAdminById(ongoingTrip.assigned_by_admin_id);
                        const adminEmail = adminData.email;

                        const truckerData = await getTruckerById(ongoingTrip.trucker_id);

                        const emailHTML = `
                          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
                            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                              <div style="background-color: #088395; padding: 20px; color: #ffffff; text-align: center;">
                                <h2 style="margin: 0; font-size: 24px;">✅ Trip Completed!</h2>
                              </div>
                              <div style="padding: 20px;">
                                <p style="font-size: 16px;">Dear Admin,</p>
                                <p style="font-size: 16px;">
                                  Trucker <strong>${truckerData.name}</strong> has successfully completed their assigned trip. Below are the trip details:
                                </p>

                                <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 15px;">
                                  <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Trip ID</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${ongoingTrip.trip_id}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Trucker</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${truckerData.name}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>Start Location</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${ongoingTrip.start_location}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>End Location</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${ongoingTrip.end_location}</td>
                                  </tr>
                                </table>

                                <p style="margin-top: 20px; font-size: 16px;">
                                  Kindly review and approve their reimbursement request in the admin panel.
                                </p>

                                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                                  — Rigor Logistics Notification System
                                </p>
                              </div>
                            </div>
                          </div>
                        `;

                        await sendEmailNotification(
                          adminEmail,
                          "Trip Completed - Reimbursement Request",
                          emailHTML,
                        );
                      } catch (emailErr) {
                        console.error("Failed to send email notification:", emailErr);
                      }

                      router.push({
                        pathname: "./reimbursementForm",
                        params: { trip_id: updated.trip_id },
                      });
                    } catch (err) {
                    }
                  }}
                >
                  <Text style={styles.completeText}>Complete Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case "recent":
        return (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {pastTrips.map((trip) => (
              <View key={trip.trip_id} style={styles.card}>
                <Text style={styles.cardText}>
                  {trip.start_location} → {trip.end_location}
                </Text>
                <Text style={styles.cardText}>
                  Distance: {trip.distance} km
                </Text>
                <Text style={styles.completedText}>✓ Completed</Text>
              </View>
            ))}
          </ScrollView>
        );

        case "reimbursements":
          const allReimbursements = pastTrips
            .flatMap((trip) => trip.reimbursements || [])
            .concat(pendingReimbursements);
        
          const uniqueReimbursements = Array.from(
            new Map(allReimbursements.map(r => [r.reimbursement_id, r])).values()
          );
        
          return (
            <View style={styles.contentWrapper}>
              {uniqueReimbursements.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>No reimbursements</Text>
                </View>
              ) : (
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 16 }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                >
                  {uniqueReimbursements.map((r) => (
                    <View key={r.reimbursement_id} style={[styles.card, styles.reimbursementCard]}>
                      <View style={styles.reimbursementHeader}>
                        <View style={styles.tripIdBadge}>
                          <Text style={styles.tripIdText}>Trip #{r.trip_id}</Text>
                        </View>
                        <Text style={styles.reimbursementDate}>
                          {r.date_submitted
                            ? new Date(r.date_submitted).toLocaleDateString()
                            : ""}
                        </Text>
                      </View>
        
                      <View style={styles.reimbursementDetails}>
                        <Text style={styles.amountLabel}>Amount</Text>
                        <Text style={styles.amountValue}>
                          ${parseFloat(r.amount?.$numberDecimal || r.amount).toFixed(2)}
                        </Text>
                      </View>
        
                      {r.type && (
                        <Text style={styles.cardText}>Type: {r.type}</Text>
                      )}
                      {r.description && (
                        <Text style={styles.cardText}>Description: {r.description}</Text>
                      )}
        

        
                      <View style={styles.statusContainer}>
                        <View
                          style={[
                            r.status === "Pending"
                              ? styles.pendingBadge
                              : styles.statusBadge,
                          ]}
                        >
                          <Text
                            style={
                              r.status === "Pending"
                                ? styles.pendingBadgeText
                                : styles.statusText
                            }
                          >
                            {r.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          );
  
    }
  };

  return (
    <Drawer
      open={isDrawerOpen}
      onOpen={() => setIsDrawerOpen(true)}
      onClose={() => setIsDrawerOpen(false)}
      renderDrawerContent={renderDrawerContent}
      drawerStyle={styles.drawer}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(true)}
            style={styles.menuButton}
          >
            <Feather name="menu" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeSection === "map"
              ? "Live Location"
              : activeSection === "ongoing"
              ? "Ongoing Trips"
              : activeSection === "recent"
              ? "Recent Trips"
              : "Pending Reimbursements"}
          </Text>
        </View>

        <View
          style={[styles.container, activeSection === "map" && styles.contentMap]}
        >
          {renderContent()}
        </View>
      </SafeAreaView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EBF4F6" },
  drawer: { backgroundColor: "#FFFFFF", width: "80%" },
  drawerContent: { flex: 1, padding: 20 },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#088395",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileIconText: { fontSize: 32, color: "#FFFFFF", fontWeight: "bold" },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#071952",
    marginBottom: 5,
  },
  role: { fontSize: 14, color: "#37B7C3", fontWeight: "500" },
  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeDrawerItem: { backgroundColor: "#EBF4F6" },
  drawerItemText: { fontSize: 16, color: "#071952", fontWeight: "500" },
  signOutItem: { backgroundColor: "#FF3B30", marginTop: "auto" },
  signOutText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  menuButton: { padding: 8 },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: "600",
    color: "#071952",
  },
  content: { flex: 1, padding: 16 },
  contentMap: { padding: 0 },
  map: { flex: 1, borderRadius: 16 },
  mapWrapper: { flex: 1 },
  noTripsBanner: {
    position: "absolute",
    top: 20,
    alignSelf: "center",
    backgroundColor: "#071952",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  noTripsText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardText: {
    fontSize: 15,
    color: "#071952",
    marginBottom: 8,
    fontWeight: "500",
  },
  statusText: {
    color: "#088395",
    backgroundColor: "#EBF4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    fontWeight: "600",
  },
  completedText: {
    color: "#059669",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: "600",
    alignSelf: "flex-start",
  },
  reimbursementCard: {
    marginHorizontal: 16,
  },
  tripIdBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#088395',
  },
  reimbursementDetails: {
    marginVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 20,
    color: '#071952',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pendingBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: '600',
  },
  completeBtn: {
    marginTop: 16,
    backgroundColor: "#088395",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  completeText: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  profileImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    marginBottom: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentWrapper: {
    flex: 1,
    padding: 16,
  },
  noContentText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  tripHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  tripRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
  },
  tripDetails: {
    gap: 8,
  },
  statusBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  emptyReimbursementWrapper: {
    flex: 1,
    backgroundColor: '#EFFFFF', 
    alignItems: 'center',
    padding: 16,
    paddingTop: 40, 
  },
  
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  emptyCardText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  reimbursementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  
  reimbursementDate: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  
  receiptWrapper: {
    marginTop: 12,
  },
  
  receiptLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: "500",
  },
  
  receiptImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  
});

export default TruckerDashboardNew;
