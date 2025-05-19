import React, { useEffect, useState, useRef } from "react";
import styles from '../../assets/styles/styleTruckerDashboard';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Drawer } from "react-native-drawer-layout";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Modal, Pressable } from "react-native";

import {
  getTripsByTruckerId,
  getTruckerByEmail,
  getReimbursementsByTripId,
  getAllReimbursements,
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

import { Trip, Reimbursement } from "../../services/util";
import { Image, RefreshControl } from "react-native";

const truckerDashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const trucker = {
    id: 1,
    name: "John Doe",
    email: "johndoe@example.com",
  }; // Hardcoded trucker data
  const isFocused = useIsFocused();
  const [rating, setRating] = useState<number>(4.5); // Hardcoded rating
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<
    Reimbursement[]
  >([]);
  const [loading, setLoading] = useState(true);
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

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter(
          (t) => t.status === "Completed"
        );
        const activeTrip = tripsData.find((t) => t.status === "Scheduled");

        const profilePicResponse = await getTruckerProfilePic(trucker.id);
        setProfilePicUrl(profilePicResponse?.profile_pic_url || null);

        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);

      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    const fetchReimbursements = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
  
        const completedTrips = tripsData.filter((trip) => trip.status === "Completed");
  
        const allReimbursements = await getAllReimbursements();
  
        const completedTripIds = completedTrips.map((trip) => trip.trip_id);
  
        const relatedReimbursements = allReimbursements.filter((reimbursement: Reimbursement) =>
          completedTripIds.includes(reimbursement.trip_id)
        );
  
        const pending = relatedReimbursements.filter((r) => r.status === "Pending");
        const approved = relatedReimbursements.filter((r) => r.status === "Approved");
  
        setPendingReimbursements([...pending, ...approved]);
      } catch (error) {
        console.error("Error fetching reimbursements:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReimbursements();
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
      } else if (
        activeSection === "ongoing" ||
        activeSection === "recent" ||
        activeSection === "reimbursements"
      ) {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter((t) => t.status === "Completed");
        const activeTrip = tripsData.find((t) => t.status === "Scheduled");
  
        const allReimbursements = await getAllReimbursements();
        const completedTripIds = completedTrips.map((trip) => trip.trip_id);
  
        const relatedReimbursements = allReimbursements.filter((reimbursement) =>
          completedTripIds.includes(reimbursement.trip_id)
        );
  
        const pending = relatedReimbursements.filter((r) => r.status === "Pending");
        const approved = relatedReimbursements.filter((r) => r.status === "Approved");
  
        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);
        setPendingReimbursements([...pending, ...approved]);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = () => {
    console.log("User signed out");
    router.push("/");
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
            showsVerticalScrollIndicator={false}
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
          if (pendingReimbursements.length === 0) {
            return (
              <View style={styles.emptyReimbursementWrapper}>
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyCardText}>No reimbursements found.</Text>
                </View>
              </View>
            );
          }

          return (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {pendingReimbursements.map((reimbursement) => (
                <View key={reimbursement.reimbursement_id} style={styles.card}>
                  <View style={styles.reimbursementHeader}>
                    <View style={styles.tripIdBadge}>
                      <Text style={styles.tripIdText}>Trip #{reimbursement.trip_id}</Text>
                    </View>
                  </View>

                  <View style={styles.reimbursementDetails}>
                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amountValue}>$ {parseFloat(reimbursement.amount.$numberDecimal).toFixed(2)}</Text>
                    {reimbursement.comments ? (
                      <Text style={styles.cardText}>Comment: {reimbursement.comments}</Text>
                    ) : null}
                  </View>

                  <View style={styles.statusContainer}>
                    <View
                      style={
                        reimbursement.status === "Pending"
                          ? styles.pendingBadge
                          : styles.completedText
                      }
                    >
                      <Text
                        style={
                          reimbursement.status === "Pending"
                            ? styles.pendingBadgeText
                            : styles.completedText
                        }
                      >
                        {reimbursement.status}
                      </Text>
                    </View>
                  </View>

                  {reimbursement.receipt_url && (
                    <View style={styles.receiptWrapper}>
                      <Text style={styles.receiptLabel}>Receipt</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUri(reimbursement.receipt_url);
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: reimbursement.receipt_url }}
                          style={styles.receiptImage}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
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
        <Modal visible={modalVisible} transparent animationType="fade">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.9)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setModalVisible(false)}
          >
            {selectedImageUri && (
              <Image
                source={{ uri: selectedImageUri }}
                style={{
                  width: "90%",
                  height: "80%",
                  resizeMode: "contain",
                  borderRadius: 10,
                }}
              />
            )}
          </Pressable>
        </Modal>
      </SafeAreaView>
    </Drawer>
  ); 
};


export default truckerDashboard;
