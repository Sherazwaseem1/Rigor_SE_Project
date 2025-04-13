import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RootState } from '../../redux/store';
import { getTripsByTruckerId, getTruckerByEmail, getReimbursementsByTripId } from '../../services/api';
import { Trip, Reimbursement } from '../../services/api';

const TruckerDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const trucker = useSelector((state: RootState) => state.user);
  const [rating, setRating] = useState<number>(0);
  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [ongoingTrip, setOngoingTrip] = useState<Trip | null>(null);
  const [pendingReimbursements, setPendingReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('map');
  const isFocused = useIsFocused();

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
        console.error('Error fetching trucker dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isFocused]);

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
        onPress={() => router.push('/')}
      >
        <Text style={[styles.drawerItemText, styles.signOutText]}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#088395" />;

    switch (activeSection) {
      case 'map':
        return (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>Live location tracking will be implemented soon!</Text>
          </View>
        );
      
      case 'ongoing':
        return ongoingTrip ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Trip</Text>
            <Text style={styles.cardText}>Trip ID: {ongoingTrip.trip_id}</Text>
            <Text style={styles.cardText}>📍 From: {ongoingTrip.start_location}</Text>
            <Text style={styles.cardText}>🏁 To: {ongoingTrip.end_location}</Text>
            <Text style={[styles.cardText, styles.statusText]}>Status: {ongoingTrip.status}</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardText}>No ongoing trips</Text>
          </View>
        );
      
      case 'recent':
        return (
          <ScrollView>
            {pastTrips.map(trip => (
              <View key={trip.trip_id} style={styles.card}>
                <Text style={styles.cardText}>Trip ID: {trip.trip_id}</Text>
                <Text style={styles.cardText}>📍 From: {trip.start_location}</Text>
                <Text style={styles.cardText}>🏁 To: {trip.end_location}</Text>
                <Text style={[styles.cardText, styles.completedText]}>Completed</Text>
              </View>
            ))}
            {pastTrips.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardText}>No recent trips</Text>
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
                <Text style={styles.cardText}>💵 Amount: ${parseFloat(item.amount.$numberDecimal).toFixed(2)}</Text>
                <Text style={[styles.cardText, styles.pendingText]}>Status: {item.status}</Text>
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
          <Text style={styles.headerTitle}>{activeSection === 'map' ? 'Live Location' : 
            activeSection === 'ongoing' ? 'Ongoing Trips' :
            activeSection === 'recent' ? 'Recent Trips' :
            'Pending Reimbursements'}</Text>
        </View>
        <View style={styles.content}>
          {renderContent()}
        </View>
      </SafeAreaView>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  drawer: {
    backgroundColor: '#fff',
    width: '80%',
  },
  drawerContent: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#088395',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileIconText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 4,
  },
  rating: {
    fontSize: 16,
    color: '#37B7C3',
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 4,
  },
  activeDrawerItem: {
    backgroundColor: '#EBF4F6',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#071952',
  },
  signOutItem: {
    marginTop: 'auto',
    backgroundColor: '#ffebee',
  },
  signOutText: {
    color: '#d32f2f',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mapText: {
    fontSize: 16,
    color: '#088395',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    color: '#088395',
    fontWeight: '500',
  },
  completedText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  pendingText: {
    color: '#FFA000',
    fontWeight: '500',
  },
});

export default TruckerDashboardNew;