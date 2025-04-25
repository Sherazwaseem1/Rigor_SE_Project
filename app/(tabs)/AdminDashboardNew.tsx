import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,              // NEW ► for smooth removal
  UIManager,                    // NEW ► Android enablement
  Platform,
  Modal,                    // NEW ► modal prompt
  TextInput, 
  Keyboard,                    // ← 1
  TouchableWithoutFeedback,
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
import { Trip, Trucker, Reimbursement } from '../../services/api';
import { Image } from 'react-native';

import { useDispatch } from "react-redux";
import { resetUser } from "../../redux/slices/userSlice";
import { persistor } from "../../redux/store";

const AdminDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  // const [activeSection, setActiveSection] = useState('map');
  const [activeSection, setActiveSection] = useState<'map' | 'trips' | 'reimbursements' | 'approved' | 'truckers' | 'analytics'>('map');
  const [tripFilter, setTripFilter] = useState<'all' | 'ongoing' | 'recent'>('all');
  const isFocused = useIsFocused();
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const dispatch = useDispatch();

  const [locations, setLocations] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(true);

  const [editVisible, setEditVisible]       = useState(false);   // NEW
  const [editAmt, setEditAmt]               = useState('');      // NEW
  const [editComment, setEditComment]       = useState('');      // NEW
  const [editingId, setEditingId]           = useState<number>(); // NEW


  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  const [truckerFilter, setTruckerFilter] = useState<'all' | 'active' | 'inactive'>('all');


  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, truckersData, reimbursementsData] = await Promise.all([
          getAllTrips(),
          getAllTruckers(),
          getAllReimbursements(),
        ]);
  
        setTrips(tripsData);
        setTruckers(truckersData);
        setReimbursements(reimbursementsData);
  
        // fetch profile picture
        const profilePicResponse = await getAdminProfileImage(admin.id);
        setProfilePicUrl(profilePicResponse?.profile_pic_url || null);
      } catch (error) {
        // console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    const fetchLocations = async () => {
      if (activeSection !== 'map') return;          // only when needed
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
        // console.error('Error fetching locations:', err);
        setLocations([]);
      } finally {
        setLocLoading(false);
      }
    };

    fetchLocations();
  }, [activeSection, admin, isFocused]);
  
  const openModify = (item: Reimbursement) => {                 // NEW
    setEditingId(item.reimbursement_id);
    setEditAmt(parseFloat(item.amount.$numberDecimal).toString());
    setEditComment('');
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
  
       // replace the one we edited in state
       setReimbursements((prev) =>
         prev.map((r) =>
           r.reimbursement_id === updated.reimbursement_id ? updated : r
         )
       );
  
       // close modal & reset
       setEditVisible(false);
       setEditAmt("");
       setEditComment("");
     } catch (err) {
       console.error("Modify failed", err);
     }
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
            <Image source={{ uri: profilePicUrl }} style={styles.profileImage} />
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
        style={[styles.drawerItem, activeSection === 'map' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('map'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Live Location</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'trips' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('trips'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Trips</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'reimbursements' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('reimbursements'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Pending Reimbursements</Text>
      </TouchableOpacity>

        {/* Approved */}
      <TouchableOpacity
        style={[styles.drawerItem, activeSection === 'approved' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('approved'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Approved Reimbursements</Text>
      </TouchableOpacity>


      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'truckers' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('truckers'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Registered Truckers</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => router.push('/TruckForm')}
      >
        <Text style={styles.drawerItemText}>Add New Truck</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => router.push('/TripAssignmentFrom')}
      >
        <Text style={styles.drawerItemText}>Assign Trips</Text>
      </TouchableOpacity>


      
      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'analytics' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('analytics'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Analytics</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerItem}
        onPress={() => router.push('/UserProfileTest')}
      >
        <Text style={styles.drawerItemText}>Profile</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.drawerItem, styles.signOutItem]}
        onPress={() => {
          handleSignOut();
          router.push('/')
        }}
      >
        <Text style={[styles.drawerItemText, styles.signOutText]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#088395" />;

    switch (activeSection) {
      case 'map':
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
               {/* empty map so the screen still shows a map */}
               <MapView
                 style={styles.map}
                 initialRegion={{
                   latitude: 30.3753,      // centre of Pakistan
                   longitude: 69.3451,
                   latitudeDelta: 15,
                   longitudeDelta: 15,
                 }}
               />

               {/* banner over the map */}
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
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={`Trip ID: ${loc.trip_id}`}
                description={`Timestamp: ${new Date(loc.timestamp).toLocaleString()}`}
              />
            ))}
          </MapView>
        );
      
      case 'trips':
        let filteredTrips = trips;
        if (tripFilter === 'ongoing') {
          filteredTrips = trips.filter(trip => trip.status === 'Scheduled');
        } else if (tripFilter === 'recent') {
          filteredTrips = trips.filter(trip => trip.status === 'Completed');
        }

        return (
          <ScrollView>
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, tripFilter === 'all' && styles.activeFilter]}
                onPress={() => setTripFilter('all')}
              >
                <Text style={[styles.filterText, tripFilter === 'all' && styles.activeFilterText]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, tripFilter === 'ongoing' && styles.activeFilter]}
                onPress={() => setTripFilter('ongoing')}
              >
                <Text style={[styles.filterText, tripFilter === 'ongoing' && styles.activeFilterText]}>In Progess</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, tripFilter === 'recent' && styles.activeFilter]}
                onPress={() => setTripFilter('recent')}
              >
                <Text style={[styles.filterText, tripFilter === 'recent' && styles.activeFilterText]}>Completed</Text>
              </TouchableOpacity>
            </View>

            {filteredTrips.map(trip => (
              <View key={trip.trip_id} style={[styles.card, styles.recentTripCard]}>
                <View style={styles.tripHeader}>
                  <View style={styles.tripRoute}>
                    <Text style={styles.routeText}>{trip.start_location} → {trip.end_location}</Text>
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
                    <Text style={styles.locationLabel}>Distance</Text>
                    <Text style={styles.locationText}>{`${trip.distance} km`}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.completedBadge, trip.status === 'Scheduled' && { backgroundColor: '#FEF3C7' }]}>
                    <Text 
                      style={[styles.completedBadgeText, 
                        trip.status === 'Scheduled' && { color: '#9B403D' }
                      ]}
                    >
                      {trip.status === 'Scheduled' ? 'In Progress' : 'Completed'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {filteredTrips.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No {tripFilter === 'all' ? '' : tripFilter} trips available</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'reimbursements':
        const pendingReimbursements = reimbursements.filter(r => r.status === 'Pending');
        return (
          <>
          <ScrollView>
            {pendingReimbursements.map(item => (
              <View key={item.reimbursement_id} style={[styles.card, styles.recentTripCard]}>
                <View style={styles.tripHeader}>
                  <View style={styles.tripRoute}>
                    <Text style={styles.routeText}>Reimbursement Request</Text>
                  </View>
                  <View style={styles.tripIdBadge}>
                    <Text style={styles.tripIdText}>#{item.reimbursement_id}</Text>
                  </View>
                </View>
                <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                <View>
                  <Text style={styles.locationLabel}>Trip ID</Text>
                  <Text style={styles.locationText}>{item.trip_id}</Text>
                </View>
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
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
                <Text style={styles.locationText}>$ {parseFloat(item.amount.$numberDecimal).toFixed(2)}</Text>
              </View>

                <View style={styles.statusContainer}>
                  <View style={[styles.completedBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.completedBadgeText, { color: '#9B403D' }]}>Pending Approval</Text>
                  </View>
                </View>
                {/* NEW ► action buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.modifyBtn]}
                    onPress={() => openModify(item)}               // MOD ► open modal
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
                    <Text style={[styles.actionText, { color: '#fff' }]}>Approve</Text>
                  </TouchableOpacity>
                </View>

              </View>
            ))}
            {pendingReimbursements.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No pending reimbursements</Text>
              </View>
            )}
          </ScrollView>
          <Modal visible={isImageModalVisible} transparent={true}>
            <View style={styles.modalBackground}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImageModalVisible(false)}>
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

                  <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Text style={{ fontSize: 28, color: star <= rating ? '#FFD700' : '#E5E7EB' }}>
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
                          const trip = trips.find(t => t.trip_id === selectedTripId);
                          if (!trip) return;

                          await approveReimbursement(
                            reimbursements.find(r => r.trip_id === selectedTripId)!.reimbursement_id,
                            admin.id
                          );

                          await updateTripRating(trip.trip_id, rating);

                          const allTruckerTrips = await getTripsByTruckerId(trip.trucker_id);
                          const completedTripsWithRatings = allTruckerTrips.filter(
                            (t) => t.status === "Completed" && t.trip_rating != null
                          );

                          const allRated = allTruckerTrips
                                            .filter((t) => t.status === "Completed")
                                            .every((t) => t.trip_rating != null);
                          
                          if (allRated && completedTripsWithRatings.length > 0) {
                            const avgRating = completedTripsWithRatings.reduce((acc, t) => acc + (t.trip_rating || 0), 0) /completedTripsWithRatings.length;
                            await updateTruckerRating(trip.trucker_id, parseFloat(avgRating.toFixed(2)));
                          }

                          setReimbursements(prev =>
                            prev.map(r =>
                              r.trip_id === selectedTripId ? { ...r, status: 'Approved' } : r
                            )
                          );
                        } catch (err) {
                          console.error("Approval or rating update failed", err);
                        } finally {
                          setIsRatingVisible(false);
                          setRating(0);
                          setSelectedTripId(null);
                        }
                      }}
                    >
                      <Text style={[styles.actionText, { color: '#fff' }]}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          </>
          
        );

        case 'analytics':
          return (
            <ScrollView>
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
                  onPress={() => router.push('/AdvancedAnalytics')}
                >
                  <Text style={styles.advancedButtonText}>Advanced Analytics</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          );

        case 'approved': {
          const approved = reimbursements.filter(r => r.status === 'Approved');
          return (
            <ScrollView>
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
          <ScrollView>
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={[styles.filterButton, truckerFilter === 'all' && styles.filterButtonActive]}
                onPress={() => setTruckerFilter('all')}
              >
                <Text style={[styles.filterButtonText, truckerFilter === 'all' && styles.filterButtonTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, truckerFilter === 'active' && styles.filterButtonActive]}
                onPress={() => setTruckerFilter('active')}
              >
                <Text style={[styles.filterButtonText, truckerFilter === 'active' && styles.filterButtonTextActive]}>Active</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.filterButton, truckerFilter === 'inactive' && styles.filterButtonActive]}
                onPress={() => setTruckerFilter('inactive')}
              >
                <Text style={[styles.filterButtonText, truckerFilter === 'inactive' && styles.filterButtonTextActive]}>Inactive</Text>
              </TouchableOpacity>
            </View>
            {filteredTruckers.map(trucker => (
              <View key={trucker.trucker_id} style={[styles.card, styles.truckerCard]}>
                <View style={styles.truckerHeader}>
                  <View style={styles.truckerInfo}>
                    <View style={styles.truckerAvatar}>
                      <Text style={styles.avatarText}>{trucker.name[0]}</Text>
                    </View>
                    <View style={styles.truckerDetails}>
                      <Text style={styles.truckerName}>{trucker.name}</Text>
                      <Text style={styles.truckerId}>ID: #{trucker.trucker_id}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: trucker.status === 'Active' ? '#E6F4EA' : '#FFF4E5' }]}>
                    <Text style={[styles.statusText, { color: trucker.status === 'Active' ? '#1E8E3E' : '#B95000' }]}>
                      {trucker.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.truckerContact}>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Phone Number</Text>
                    <Text style={styles.contactValue}>Phone: {trucker.phone_number}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>Email: {trucker.email}</Text>
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
          <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={styles.menuButton}>
            <Feather name="menu" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{activeSection === 'map' ? 'Live Location' : 
            activeSection === 'trips' ? 'Trips' :
            activeSection === 'reimbursements' ? 'Pending Reimbursements' :
            activeSection === 'approved' ? 'Approved Reimbursements' :
            activeSection === 'truckers' ? 'Registered Truckers' :
            'Analytics'}</Text>
        </View>
        <View style={[styles.content, activeSection === 'map' && styles.contentMap]}>
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
                blurOnSubmit      // ← 3
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
                  <Text style={[styles.actionText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilter: {
    backgroundColor: '#088395',
  },
  filterText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#ffffff',
  },
  filterButtonActive: {
    backgroundColor: '#088395',
    borderColor: '#088395',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  advancedButton: {
    backgroundColor: '#088395',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  advancedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  analyticsCard: {
    marginBottom: 16,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#088395',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#EBF4F6',
  },
  truckerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  truckerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  truckerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 'auto',
    alignSelf: 'flex-start',
    // paddingHorizontal: 0,
  },
  truckerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#088395',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  truckerDetails: {
    flex: 1,
  },
  truckerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 4,
  },
  truckerId: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8
  },
  truckerContact: {
    marginTop: 8,
    backgroundColor: '#EBF4F6',
    borderRadius: 12,
    padding: 16,
  },
  contactItem: {
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  recentTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripRoute: {
    flex: 1,
    marginRight: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#071952',
  },
  tripIdBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  tripIdText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#088395',
  },
  tripDetails: {
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    transform: [{ translateY: -2 }],
  },
  cardText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    fontWeight: '500',
  },
  statusText: {
    color: '#088395',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    textAlign: 'center',
  },
  completedText: {
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  pendingText: {
    color: '#D97706',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  hourglassIcon: {
    marginRight: 4,
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    width: '80%',
  },
  drawerContent: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#088395',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileIconText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#37B7C3',
    fontWeight: '500',
  },
  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeDrawerItem: {
    backgroundColor: '#EBF4F6',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#071952',
    fontWeight: '500',
  },
  signOutItem: {
    marginTop: 'auto',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#071952',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  mapText: {
    fontSize: 16,
    color: '#071952',
    textAlign: 'center',
  },
  profileImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  map: { flex: 1, borderRadius: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentMap: {       
    padding: 0,
  },
  noTripsBanner: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#071952',     
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapWrapper: {
    flex: 1,
  },
  noTripsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {                                          // NEW
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {                                          // NEW
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  approveBtn: { backgroundColor: '#047857' },           // NEW green
  modifyBtn: { backgroundColor: '#EBF4F6' },            // NEW neutral
  actionText: { fontWeight: '600', color: '#071952' }, 
  modalBackdrop: {                         // NEW
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {                             // NEW
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {                            // NEW
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 12,
  },
  modalInput: {                            // NEW
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  modalActions: {                          // NEW
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  receiptThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginTop: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  
  fullImage: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  
  closeArea: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 10,
  },

  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  
  modalCloseText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
});


export default AdminDashboardNew;
