import React, { useEffect, useState } from "react";
import styles from "../../assets/styles/styleAdminDashboard";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import axios from 'axios';  
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';   
import { RootState } from '../../redux/store';
import { getAllTrips, getAllTruckers, getAllReimbursements, getAdminProfileImage, getAllLocations, getLocationById, approveReimbursement, modifyReimbursement, updateTripRating, updateTruckerRating, getTripsByTruckerId   } from '../../services/api';
import { Trip, Trucker, Reimbursement, Location } from '../../services/util';
import { Image } from 'react-native';

import { useDispatch } from "react-redux";
import { resetUser } from "../../redux/slices/userSlice";
import { persistor } from "../../redux/store";

const adminDashboard = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<
    "map" | "trips" | "reimbursements" | "approved" | "truckers" | "analytics"
  >("map");
  const [tripFilter, setTripFilter] = useState<"all" | "ongoing" | "recent">(
    "all"
  );
  const isFocused = useIsFocused();
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const dispatch = useDispatch();

  const [locations, setLocations] = useState<Location[]>([]);
  const [locLoading, setLocLoading] = useState(true);

  const [editVisible, setEditVisible] = useState(false);
  const [editAmt, setEditAmt] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editingId, setEditingId] = useState<number>();

  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  const [truckerFilter, setTruckerFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, truckersData, reimbursementsData] = await Promise.all(
          [getAllTrips(), getAllTruckers(), getAllReimbursements()]
        );

        setTrips(tripsData);
        setTruckers(truckersData);
        setReimbursements(reimbursementsData);
        const profilePicResponse = await getAdminProfileImage(admin.id);
        setProfilePicUrl(profilePicResponse?.profile_pic_url || null);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isFocused]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (activeSection !== "map") return;
      setLocLoading(true);
      try {
        if (admin.isAdmin) {
          const allLocations = await getAllLocations();
          setLocations(allLocations);
        } else {
          const loc = await getLocationById(admin.id);
          setLocations([loc]);
        }
      } catch (err) {
        setLocations([]);
      } finally {
        setLocLoading(false);
      }
    };

    fetchLocations();
  }, [activeSection, admin, isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      switch (activeSection) {
        case 'map':
          if (admin.isAdmin) {
            const locs = await getAllLocations();
            setLocations(locs);
          } else {
            const loc = await getLocationById(admin.id);
            setLocations([loc]);
          }
          break;
  
        case 'trips': {
          const tripsData = await getAllTrips();
          setTrips(tripsData);
          break;
        }
  
        case 'reimbursements': {
          const data = await getAllReimbursements();
          setReimbursements(data);
          break;
        }
  
        case 'truckers': {
          const data = await getAllTruckers();
          setTruckers(data);
          break;
        }
  
        case 'analytics': {
          const [t, r, tr] = await Promise.all([
            getAllTrips(),
            getAllReimbursements(),
            getAllTruckers(),
          ]);
          setTrips(t);
          setReimbursements(r);
          setTruckers(tr);
          break;
        }
      }
    } catch (err) {
      console.warn('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const openModify = (item: Reimbursement) => {       
    setEditingId(item.reimbursement_id);
    setEditAmt(parseFloat(item.amount.$numberDecimal).toString());
    setEditComment("");
    setEditVisible(true);
  };

  const saveModifiedReimbursement = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      if (editingId == null) return;
      const updated = await modifyReimbursement(editingId, {
        amount: parseFloat(editAmt),
        comments: editComment,
      });
      setReimbursements((prev) =>
        prev.map((r) =>
          r.reimbursement_id === updated.reimbursement_id ? updated : r
        )
      );
      setEditVisible(false);
      setEditAmt("");
      setEditComment("");
    } catch (err) {}
  };

  const handleSignOut = () => {
    dispatch(resetUser());
    persistor.purge();
  };

  const renderDrawerContent = () => (
    <ScrollView style={styles.drawerContent}>
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
            <Text style={styles.profileIconText}>{admin.name[0]}</Text>
          </View>
        )}

        <Text style={styles.profileName}>{admin.name}</Text>
        <Text style={styles.role}>Administrator</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "map" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("map");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Live Location</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "trips" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("trips");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Trips</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "reimbursements" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("reimbursements");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Pending Reimbursements</Text>
      </TouchableOpacity>

      {/* Approved */}
      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "approved" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("approved");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Approved Reimbursements</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "truckers" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("truckers");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Registered Truckers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push('/truckForm')}
      >
        <Text style={styles.drawerItemText}>Add New Truck</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push('/tripAssignmentForm')}
      >
        <Text style={styles.drawerItemText}>Assign Trips</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.drawerItem,
          activeSection === "analytics" && styles.activeDrawerItem,
        ]}
        onPress={() => {
          setActiveSection("analytics");
          setIsDrawerOpen(false);
        }}
      >
        <Text style={styles.drawerItemText}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => router.push('/userProfile')}
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
        <Text style={[styles.drawerItemText, styles.signOutText]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#088395" />;

    switch (activeSection) {
      case "map":
        if (locLoading) {
          return (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#088395" />
            </View>
          );
        }
        if (locations.length === 0) {
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
                <Text style={styles.noTripsText}>No active trips</Text>
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
                title={`Trip ID: ${loc.trip_id}`}
                description={`Timestamp: ${new Date(
                  loc.timestamp
                ).toLocaleString()}`}
              />
            ))}
          </MapView>
        );

      case "trips":
        let filteredTrips = trips;
        if (tripFilter === "ongoing") {
          filteredTrips = trips.filter((trip) => trip.status === "Scheduled");
        } else if (tripFilter === "recent") {
          filteredTrips = trips.filter((trip) => trip.status === "Completed");
        }

        return (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  tripFilter === "all" && styles.activeFilter,
                ]}
                onPress={() => setTripFilter("all")}
              >
                <Text
                  style={[
                    styles.filterText,
                    tripFilter === "all" && styles.activeFilterText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  tripFilter === "ongoing" && styles.activeFilter,
                ]}
                onPress={() => setTripFilter("ongoing")}
              >
                <Text
                  style={[
                    styles.filterText,
                    tripFilter === "ongoing" && styles.activeFilterText,
                  ]}
                >
                  In Progess
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  tripFilter === "recent" && styles.activeFilter,
                ]}
                onPress={() => setTripFilter("recent")}
              >
                <Text
                  style={[
                    styles.filterText,
                    tripFilter === "recent" && styles.activeFilterText,
                  ]}
                >
                  Completed
                </Text>
              </TouchableOpacity>
            </View>

            {filteredTrips.map((trip) => (
              <View
                key={trip.trip_id}
                style={[styles.card, styles.recentTripCard]}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripRoute}>
                    <Text style={styles.routeText}>
                      {trip.start_location} → {trip.end_location}
                    </Text>
                  </View>
                  <View style={styles.tripIdBadge}>
                    <Text style={styles.tripIdText}>#{trip.trip_id}</Text>
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Trucker Id</Text>
                    <Text style={styles.locationText}>{trip.trucker_id}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Trucker</Text>
                    <Text style={styles.locationText}>
                      {truckers.find(
                        (trucker) => trucker.trucker_id === trip.trucker_id
                      )?.name || "Unknown"}
                    </Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Distance</Text>
                    <Text
                      style={styles.locationText}
                    >{`${trip.distance} km`}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.completedBadge,
                      trip.status === "Scheduled" && {
                        backgroundColor: "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.completedBadgeText,
                        trip.status === "Scheduled" && { color: "#9B403D" },
                      ]}
                    >
                      {trip.status === "Scheduled"
                        ? "In Progress"
                        : "Completed"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {filteredTrips.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>
                  No {tripFilter === "all" ? "" : tripFilter} trips available
                </Text>
              </View>
            )}
          </ScrollView>
        );

      case "reimbursements":
        const pendingReimbursements = reimbursements.filter(
          (r) => r.status === "Pending"
        );
        return (
          <>
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {pendingReimbursements.map((item) => (
                <View
                  key={item.reimbursement_id}
                  style={[styles.card, styles.recentTripCard]}
                >
                  <View style={styles.tripHeader}>
                    <View style={styles.tripRoute}>
                      <Text style={styles.routeText}>
                        Reimbursement Request
                      </Text>
                    </View>
                    <View style={styles.tripIdBadge}>
                      <Text style={styles.tripIdText}>
                        #{item.reimbursement_id}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                    <View>
                      <Text style={styles.locationLabel}>Trip ID</Text>
                      <Text style={styles.locationText}>{item.trip_id}</Text>
                      <View>
                        <Text style={styles.locationLabel}>Trucker</Text>
                        <Text style={styles.locationText}>
                          {trips.find((trip) => trip.trip_id === item.trip_id)
                            ?.trucker_id
                            ? truckers.find(
                                (trucker) =>
                                  trucker.trucker_id ===
                                  trips.find(
                                    (trip) => trip.trip_id === item.trip_id
                                  )?.trucker_id
                              )?.name || "Unknown"
                            : "Unknown"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{ flexDirection: "column", alignItems: "center" }}
                    >
                      <Text style={styles.locationLabel}>Receipt</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedImageUrl(item.receipt_url);
                          setImageModalVisible(true);
                        }}
                      >
                        <Image
                          source={{ uri: item.receipt_url }}
                          style={styles.receiptThumbnail}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Amount</Text>
                    <Text style={styles.locationText}>
                      $ {parseFloat(item.amount.$numberDecimal).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.completedBadge,
                        { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.completedBadgeText,
                          { color: "#9B403D" },
                        ]}
                      >
                        Pending Approval
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.modifyBtn]}
                      onPress={() => openModify(item)}
                    >
                      <Text style={styles.actionText}>Modify</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => {
                        setSelectedTripId(item.trip_id);
                        setIsRatingVisible(true);
                      }}
                    >
                      <Text style={[styles.actionText, { color: "#fff" }]}>
                        Approve
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {pendingReimbursements.length === 0 && (
                <View style={[styles.card, styles.emptyCard]}>
                  <Text style={styles.emptyText}>
                    No pending reimbursements
                  </Text>
                </View>
              )}
            </ScrollView>
            <Modal visible={isImageModalVisible} transparent={true}>
              <View style={styles.modalBackground}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setImageModalVisible(false)}
                >
                  <Text style={styles.modalCloseText}>✖</Text>
                </TouchableOpacity>
                <Image
                  source={{ uri: selectedImageUrl! }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              </View>
            </Modal>
            <Modal
              transparent
              visible={isRatingVisible}
              animationType="fade"
              onRequestClose={() => setIsRatingVisible(false)}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalBackdrop}>
                  <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Rate this Trip</Text>

                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginBottom: 12,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setRating(star)}
                        >
                          <Text
                            style={{
                              fontSize: 28,
                              color: star <= rating ? "#FFD700" : "#E5E7EB",
                            }}
                          >
                            ★
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.modifyBtn]}
                        onPress={() => setIsRatingVisible(false)}
                      >
                        <Text style={styles.actionText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={async () => {
                          try {
                            const trip = trips.find(
                              (t) => t.trip_id === selectedTripId
                            );
                            if (!trip) return;

                            await approveReimbursement(
                              reimbursements.find(
                                (r) => r.trip_id === selectedTripId
                              )!.reimbursement_id,
                              admin.id
                            );

                            await updateTripRating(trip.trip_id, rating);

                            const allTruckerTrips = await getTripsByTruckerId(
                              trip.trucker_id
                            );
                            const completedTrips = allTruckerTrips.filter(
                              (t) => t.status === "Completed"
                            );

                            const ratedTrips = completedTrips.filter(
                              (t) => typeof t.trip_rating === "number"
                            );

                            const avgRating =
                              ratedTrips.length > 0
                                ? ratedTrips.reduce(
                                    (sum, trip) =>
                                      sum + (trip.trip_rating || 0),
                                    0
                                  ) / ratedTrips.length
                                : 1;

                            await updateTruckerRating(
                              trip.trucker_id,
                              parseFloat(avgRating.toFixed(1))
                            );

                            setReimbursements((prev) =>
                              prev.map((r) =>
                                r.trip_id === selectedTripId
                                  ? { ...r, status: "Approved" }
                                  : r
                              )
                            );
                          } catch (err) {
                          } finally {
                            setIsRatingVisible(false);
                            setRating(0);
                            setSelectedTripId(null);
                          }
                        }}
                      >
                        <Text style={[styles.actionText, { color: "#fff" }]}>
                          Submit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </>
        );

      case "analytics":
        return (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={[styles.card, styles.analyticsCard]}>
              <Text style={styles.sectionTitle}>Trip Statistics</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {trips.filter((t) => t.status === "Completed").length}
                  </Text>
                  <Text style={styles.statLabel}>Completed Trips</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {trips.filter((t) => t.status === "Scheduled").length}
                  </Text>
                  <Text style={styles.statLabel}>Ongoing Trips</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, styles.analyticsCard]}>
              <Text style={styles.sectionTitle}>Reimbursement Overview</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {
                      reimbursements.filter((r) => r.status === "Pending")
                        .length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {
                      reimbursements.filter((r) => r.status === "Approved")
                        .length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Approved</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, styles.analyticsCard]}>
              <Text style={styles.sectionTitle}>Fleet Status</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {truckers.filter((t) => t.status === "Active").length}
                  </Text>
                  <Text style={styles.statLabel}>Active Truckers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {truckers.filter((t) => t.status === "Inactive").length}
                  </Text>
                  <Text style={styles.statLabel}>Available Truckers</Text>
                </View>
              </View>
            </View>
            <View>
              <TouchableOpacity
                style={styles.advancedButton}
                onPress={() => router.push("/AdvancedAnalytics")}
              >
                <Text style={styles.advancedButtonText}>
                  Advanced Analytics
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );

      case "approved": {
        const approved = reimbursements.filter((r) => r.status === "Approved");
        return (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {approved.map((item) => (
              <View
                key={item.reimbursement_id}
                style={[styles.card, styles.recentTripCard]}
              >
                <View style={styles.tripHeader}>
                  <View style={styles.tripRoute}>
                    <Text style={styles.routeText}>
                      Reimbursement #{item.reimbursement_id}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Trip ID</Text>
                    <Text style={styles.locationText}>{item.trip_id}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Amount</Text>
                    <Text style={styles.locationText}>
                      $ {parseFloat(item.amount.$numberDecimal).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Trucker</Text>
                    <Text style={styles.locationText}>
                      {trips.find((trip) => trip.trip_id === item.trip_id)
                        ?.trucker_id
                        ? truckers.find(
                            (trucker) =>
                              trucker.trucker_id ===
                              trips.find(
                                (trip) => trip.trip_id === item.trip_id
                              )?.trucker_id
                          )?.name || "Unknown"
                        : "Unknown"}
                    </Text>
                  </View>
                  {item.comments ? (
                    <View style={styles.locationContainer}>
                      <Text style={styles.locationLabel}>Comments</Text>
                      <Text style={styles.locationText}>{item.comments}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.statusContainer}>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Approved</Text>
                  </View>
                </View>
              </View>
            ))}
            {approved.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No approved reimbursements</Text>
              </View>
            )}
          </ScrollView>
        );
      }

        case 'analytics':
          return (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={[styles.card, styles.analyticsCard]}>
                <Text style={styles.sectionTitle}>Trip Statistics</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{trips.filter(t => t.status === 'Completed').length}</Text>
                    <Text style={styles.statLabel}>Completed Trips</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{trips.filter(t => t.status === 'Scheduled').length}</Text>
                    <Text style={styles.statLabel}>Ongoing Trips</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, styles.analyticsCard]}>
                <Text style={styles.sectionTitle}>Reimbursement Overview</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{reimbursements.filter(r => r.status === 'Pending').length}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{reimbursements.filter(r => r.status === 'Approved').length}</Text>
                    <Text style={styles.statLabel}>Approved</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.card, styles.analyticsCard]}>
                <Text style={styles.sectionTitle}>Fleet Status</Text>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{truckers.filter(t => t.status === 'Active').length}</Text>
                    <Text style={styles.statLabel}>Active Truckers</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{truckers.filter(t => t.status === 'Inactive').length}</Text>
                    <Text style={styles.statLabel}>Available Truckers</Text>
                  </View>
                </View>
              </View>
              <View>
                <TouchableOpacity 
                  style={styles.advancedButton}
                  onPress={() => router.push('/advancedAnalytics')}
                >
                  <Text style={styles.advancedButtonText}>Advanced Analytics</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          );

        case 'approved': {
          const approved = reimbursements.filter(r => r.status === 'Approved');
          return (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {approved.map(item => (
                <View key={item.reimbursement_id} style={[styles.card, styles.recentTripCard]}>
                  <View style={styles.tripHeader}>
                    <View style={styles.tripRoute}>
                      <Text style={styles.routeText}>Reimbursement #{item.reimbursement_id}</Text>
                    </View>
                  </View>
                  <View style={styles.tripDetails}>
                    <View style={styles.locationContainer}>
                      <Text style={styles.locationLabel}>Trip ID</Text>
                      <Text style={styles.locationText}>{item.trip_id}</Text>
                    </View>
                    <View style={styles.locationContainer}>
                      <Text style={styles.locationLabel}>Amount</Text>
                      <Text style={styles.locationText}>
                        $ {parseFloat(item.amount.$numberDecimal).toFixed(2)}
                      </Text>
                    </View>
                    {item.comments ? (
                      <View style={styles.locationContainer}>
                        <Text style={styles.locationLabel}>Comments</Text>
                        <Text style={styles.locationText}>{item.comments}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓ Approved</Text>
                    </View>
                  </View>
                </View>
              ))}
              {approved.length === 0 && (
                <View style={[styles.card, styles.emptyCard]}>
                  <Text style={styles.emptyText}>No approved reimbursements</Text>
                </View>
              )}
            </ScrollView>
          );
        }

      case 'truckers':
        const filteredTruckers = truckers.filter(trucker => 
          truckerFilter === 'all' ? true : 
          truckerFilter === 'active' ? trucker.status === 'Active' : 
          trucker.status === 'Inactive'
        );
        return (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  truckerFilter === "all" && styles.filterButtonActive,
                ]}
                onPress={() => setTruckerFilter("all")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    truckerFilter === "all" && styles.filterButtonTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  truckerFilter === "active" && styles.filterButtonActive,
                ]}
                onPress={() => setTruckerFilter("active")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    truckerFilter === "active" && styles.filterButtonTextActive,
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  truckerFilter === "inactive" && styles.filterButtonActive,
                ]}
                onPress={() => setTruckerFilter("inactive")}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    truckerFilter === "inactive" &&
                      styles.filterButtonTextActive,
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
            </View>
            {filteredTruckers.map((trucker) => (
              <View
                key={trucker.trucker_id}
                style={[styles.card, styles.truckerCard]}
              >
                <View style={styles.truckerHeader}>
                  <View style={styles.truckerInfo}>
                    <View style={styles.truckerAvatar}>
                      <Text style={styles.avatarText}>{trucker.name[0]}</Text>
                    </View>
                    <View style={styles.truckerDetails}>
                      <Text style={styles.truckerName}>{trucker.name}</Text>
                      <Text style={styles.truckerId}>
                        ID: #{trucker.trucker_id}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadgeBase,
                      trucker.status === "Active"
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTextBase,
                        trucker.status === "Active"
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}
                    >
                      {trucker.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.truckerContact}>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Phone Number</Text>
                    <Text style={styles.contactValue}>
                      Phone: {trucker.phone_number}
                    </Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>
                      Email: {trucker.email}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {truckers.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No registered truckers</Text>
              </View>
            )}
          </ScrollView>
        );

      default:
        return null;
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
              : activeSection === "trips"
              ? "Trips"
              : activeSection === "reimbursements"
              ? "Pending Reimbursements"
              : activeSection === "approved"
              ? "Approved Reimbursements"
              : activeSection === "truckers"
              ? "Registered Truckers"
              : "Analytics"}
          </Text>
        </View>
        <View
          style={[styles.content, activeSection === "map" && styles.contentMap]}
        >
          {renderContent()}
        </View>
      </SafeAreaView>
      <Modal
        transparent
        visible={editVisible}
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Modify Reimbursement</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Amount"
                keyboardType="numeric"
                value={editAmt}
                onChangeText={setEditAmt}
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                placeholder="Add comments…"
                multiline
                value={editComment}
                onChangeText={setEditComment}
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.modifyBtn]}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={saveModifiedReimbursement}
                >
                  <Text style={[styles.actionText, { color: "#fff" }]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Drawer>
  );
};


export default adminDashboard;
