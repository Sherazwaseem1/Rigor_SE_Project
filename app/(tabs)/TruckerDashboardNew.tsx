import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RootState } from '../../redux/store';
import MapView, { Marker } from 'react-native-maps';          // NEW ► map
import * as Location from 'expo-location';
import {
  getTripsByTruckerId,
  getTruckerByEmail,
  getReimbursementsByTripId,
  getAllLocations,                                          // NEW ► map data
  updateLocation,       
  completeTrip,
  deleteLocation
} from '../../services/api'; import { Trip, Reimbursement } from '../../services/api';

import { useDispatch } from "react-redux";
import { resetUser } from "../../redux/slices/userSlice";
import { persistor } from "../../redux/store";

const TruckerDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const trucker = useSelector((state: RootState) => state.user);
  const [rating, setRating] = useState<number>(0);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  // const [activeSection, setActiveSection] = useState('map');
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState<'map' | 'ongoing' | 'recent' | 'reimbursements'>('map');   // MOD ► typed
  const isFocused = useIsFocused();

  const [locations, setLocations] = useState<any[]>([]);     // NEW ► latest GPS fix(es)
  const [locLoading, setLocLoading] = useState(true);        // NEW ► spinner while fetching

  const firstLocLoad = React.useRef(true); 
  const locationIdRef = React.useRef<number | null>(null);            // NEW ► row we’ll update
  const watchSubRef = React.useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripsData = await getTripsByTruckerId(trucker.id);
        const completedTrips = tripsData.filter(trip => trip.status === 'Completed');
        const activeTrip = tripsData.find(trip => trip.status === 'Scheduled');

        const truckerData = await getTruckerByEmail(trucker.email);
        setRating(truckerData.rating || 0);

        setPastTrips(completedTrips);
        setOngoingTrip(activeTrip || null);

        const reimbursements = await Promise.all(
          tripsData.map(trip => getReimbursementsByTripId(trip.trip_id))
        );
        setPendingReimbursements(reimbursements.flat().filter(r => r.status === 'Pending'));
      } catch (error) {
        // console.error('Error fetching trucker dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    const fetchLocations = async () => {
      if (activeSection !== 'map') return;                   // NEW ► only when map open
      if (!ongoingTrip) {                                    // NEW ► no active trip
        setLocations([]);
        // setLocLoading(false);
        if (firstLocLoad.current) setLocLoading(false);  // NEW
        return;
      }
      // setLocLoading(true);
      if (firstLocLoad.current) setLocLoading(true);  
      try {
        const allLocs = await getAllLocations();             // NEW ► fetch all
        const tripLoc = allLocs.filter(                      // NEW ► keep only this trip
          (l: any) => l.trip_id === ongoingTrip.trip_id
        );
        setLocations(tripLoc);
        if (tripLoc.length) locationIdRef.current = tripLoc[0].location_id;
      } catch (err) {
        console.error('Error fetching live locations:', err);
        setLocations([]);
      } finally {
        if (firstLocLoad.current) {                      // NEW
          setLocLoading(false);                          // hide spinner after first load
          firstLocLoad.current = false;                  // subsequent polls skip spinner
        }
      }
    };

    fetchLocations();
    interval = setInterval(fetchLocations, 15000);           // NEW ► auto‑refresh

    return () => interval && clearInterval(interval);        // NEW ► clean‑up
  }, [activeSection, ongoingTrip, isFocused]);

  useEffect(() => {
    const startWatching = async () => {
      if (!ongoingTrip || activeSection !== 'map') return;
  
      /* ask permission once */
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
  
      /* begin high‑accuracy stream */
      watchSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        async (pos) => {
          /* update local marker immediately */
          setLocations((prev) => {
            if (!prev.length) return prev;
            const latest = prev[0];
            const updated = {
              ...latest,
              latitude:  pos.coords.latitude,
              longitude: pos.coords.longitude,
              timestamp: new Date().toISOString(),
            };
            return [updated, ...prev.slice(1)];
          });
  
          /* push to backend (if we know the row id) */
          if (locationIdRef.current) {
            try {
              await updateLocation(locationIdRef.current, {
                latitude:  pos.coords.latitude,
                longitude: pos.coords.longitude,
                timestamp:  new Date(),
              });
            } catch (err) {
              console.warn('updateLocation failed', err);
            }
          }
        }
      );
    };
  
    startWatching();
  
    /* cleanup on blur / trip end */
    return () => {
      if (watchSubRef.current) {
        watchSubRef.current.remove();
        watchSubRef.current = null;
      }
    };
  }, [ongoingTrip, activeSection]);   


  const handleSignOut = () => {
    dispatch(resetUser());      
    persistor.purge();           
  };

  const renderDrawerContent = () => (
    <View style={styles.drawerContent}>
      <View style={styles.profileSection}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>{trucker.name[0]}</Text>
        </View>
        <Text style={styles.profileName}>{trucker.name}</Text>
        <Text style={styles.rating}>⭐ {rating.toFixed(1)}/5</Text>
      </View>

      <TouchableOpacity
        style={[styles.drawerItem, activeSection === 'map' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('map'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Live Location</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'ongoing' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('ongoing'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Ongoing Trips</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'recent' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('recent'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Recent Trips</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'reimbursements' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('reimbursements'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Pending Reimbursements</Text>
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
    </View>
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

        /* no active trip OR no GPS yet → fallback banner */
        if (!ongoingTrip || locations.length === 0) {
          return (
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 30.3753,   // centre of Pakistan
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

        /* else: show marker(s) for this trip */
        return (
          <MapView style={styles.map}>
            {locations.map(loc => (
              <Marker
                key={loc.location_id}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={`Trip #${loc.trip_id}`}
                description={new Date(loc.timestamp).toLocaleString()}
              />
            ))}
          </MapView>
        );

      case 'ongoing':
        return ongoingTrip ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Trip</Text>
            <Text style={styles.cardText}>Trip ID: {ongoingTrip.trip_id}</Text>
            <Text style={styles.cardText}>📍 From: {ongoingTrip.start_location}</Text>
            <Text style={styles.cardText}>🏁 To: {ongoingTrip.end_location}</Text>
            <Text style={[styles.cardText, styles.statusText]}>Status: {ongoingTrip.status}</Text>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={async () => {
                try {
                  // 1) mark it completed in the DB
                  const updated = await completeTrip(ongoingTrip.trip_id);

                  if (locationIdRef.current) {
                    await deleteLocation(locationIdRef.current);
                  }
                  setLocations([]);
                  locationIdRef.current = null;

                  
                  // 2) remove from ongoing, add to past
                  setOngoingTrip(null);
                  setPastTrips(prev => [updated, ...prev]);
                  // 3) route to reimbursement form
                  router.push({
                    pathname: './Reimbursement_form',
                    params: { trip_id: updated.trip_id },
                  });
                } catch (err) {
                  console.error('Complete trip failed', err);
                }
              }}
            >
              <Text style={styles.completeText}>Complete Trip</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No ongoing trips</Text>
          </View>
        );

      case 'recent':
        return (
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            {pastTrips.map(trip => (
              <View key={trip.trip_id} style={[styles.card, styles.tripCard]}>
                <View style={styles.tripHeader}>
                  <View style={styles.routeContainer}>
                    <Text style={styles.tripRoute}>{trip.start_location} → {trip.end_location}</Text>
                    <Text style={styles.tripDate}>{new Date(trip.start_time).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.tripIdBadge}>
                    <Text style={styles.tripIdText}>#{trip.trip_id}</Text>
                  </View>
                </View>
                <View style={styles.tripDetails}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Start Location</Text>
                    <Text style={styles.locationText}>{trip.start_location}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Destination</Text>
                    <Text style={styles.locationText}>{trip.end_location}</Text>
                  </View>
                  <View style={styles.distanceContainer}>
                    <Text style={styles.locationLabel}>Distance</Text>
                    <Text style={styles.locationText}>{trip.distance} km</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Completed</Text>
                  </View>
                </View>
              </View>
            ))}
            {pastTrips.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No recent trips</Text>
              </View>
            )}
          </ScrollView>
        );

      case 'reimbursements':
        return (
          <ScrollView>
            {pendingReimbursements.map(item => (
              <View key={item.reimbursement_id} style={styles.card}>
                <Text style={styles.cardText}>Trip ID: {item.trip_id}</Text>
                <Text style={styles.cardText}>
                  💵 Amount: ${parseFloat(item.amount.$numberDecimal).toFixed(2)}
                </Text>
                <Text style={[styles.cardText, styles.pendingText]}>
                  Status: {item.status}
                </Text>
              </View>
            ))}
            {pendingReimbursements.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardText}>No pending reimbursements</Text>
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
            <IconSymbol name="menu" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeSection === 'map' ? 'Live Location' : 
             activeSection === 'ongoing' ? 'Ongoing Trips' :
             activeSection === 'recent' ? 'Recent Trips' :
             'Pending Reimbursements'}
          </Text>
        </View>
        <View style={[
          styles.content,
          activeSection === 'map' && styles.contentMap,      // NEW ► remove padding for map
        ]}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentMap: { padding: 0 }, 
  mapWrapper: { flex: 1 },                                  // NEW
  map: { flex: 1 },                                         // NEW
  noTripsBanner: {                                          // NEW
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
  noTripsText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },   // NEW

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },   // NEW (was in admin)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF4F6',
    shadowColor: '#071952',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EBF4F6',
  },
  tripCard: {
    // Additional styling can be adjusted here if needed
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeContainer: {
    flex: 1,
    marginRight: 12,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#071952',
  },
  tripDate: {
    fontSize: 14,
    color: '#37B7C3',
    marginTop: 4,
  },
  tripDetails: {
    marginBottom: 16,
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
  locationContainer: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#37B7C3',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#071952',
    fontWeight: '500',
  },
  distanceContainer: {
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  completedBadge: {
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#088395',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#EBF4F6',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 16,
    color: '#088395',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 15,
    color: '#071952',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  statusText: {
    color: '#088395',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 4,
  },
  pendingText: {
    color: '#088395',
    fontWeight: '500',
  },
  // New style to adjust padding inside the scroll view for Recent Trips
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  // Drawer related styles
  drawer: {
    flex: 1,
    width: 300,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF4F6',
    backgroundColor: '#ffffff',
    marginBottom: 16,
    shadowColor: '#071952',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#071952',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  profileIconText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
  },
  rating: {
    fontSize: 16,
    color: '#088395',
    marginTop: 4,
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#ffffff',
    shadowColor: '#071952',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeDrawerItem: {
    backgroundColor: '#EBF4F6',
    borderLeftWidth: 4,
    borderLeftColor: '#088395',
    shadowColor: '#088395',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#071952',
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
  menuButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#071952',
  },
  completeBtn: {
    marginTop: 16,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TruckerDashboardNew;
