import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RootState } from '../../redux/store';
import { getAllTrips, getAllTruckers, getAllReimbursements } from '../../services/api';
import { Trip, Trucker, Reimbursement } from '../../services/api';

const AdminDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('map');
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsData, truckersData, reimbursementsData] = await Promise.all([
          getAllTrips(),
          getAllTruckers(),
          getAllReimbursements()
        ]);

        setTrips(tripsData);
        setTruckers(truckersData);
        setReimbursements(reimbursementsData);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
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
          <Text style={styles.profileIconText}>{admin.name[0]}</Text>
        </View>
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
        style={[styles.drawerItem, activeSection === 'ongoing' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('ongoing'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Ongoing Trips</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.drawerItem, activeSection === 'reimbursements' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('reimbursements'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Pending Reimbursements</Text>
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
        style={[styles.drawerItem, activeSection === 'recent' && styles.activeDrawerItem]}
        onPress={() => { setActiveSection('recent'); setIsDrawerOpen(false); }}
      >
        <Text style={styles.drawerItemText}>Recent Trips</Text>
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
        const ongoingTrips = trips.filter(trip => trip.status === 'Scheduled');
        return (
          <ScrollView>
            {ongoingTrips.map(trip => (
              <View key={trip.trip_id} style={styles.card}>
                <Text style={styles.cardText}>Trip ID: {trip.trip_id}</Text>
                <Text style={styles.cardText}>📍 From: {trip.start_location}</Text>
                <Text style={styles.cardText}>🏁 To: {trip.end_location}</Text>
                <Text style={[styles.cardText, styles.statusText]}>Status: {trip.status}</Text>
              </View>
            ))}
            {ongoingTrips.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardText}>No ongoing trips</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'recent':
        const completedTrips = trips.filter(trip => trip.status === 'Completed');
        return (
          <ScrollView>
            {completedTrips.map(trip => (
              <View key={trip.trip_id} style={styles.card}>
                <Text style={styles.cardText}>Trip ID: {trip.trip_id}</Text>
                <Text style={styles.cardText}>📍 From: {trip.start_location}</Text>
                <Text style={styles.cardText}>🏁 To: {trip.end_location}</Text>
                <Text style={[styles.cardText, styles.completedText]}>Completed</Text>
              </View>
            ))}
            {completedTrips.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardText}>No recent trips</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'reimbursements':
        const pendingReimbursements = reimbursements.filter(r => r.status === 'Pending');
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

      case 'truckers':
        return (
          <ScrollView>
            {truckers.map(trucker => (
              <View key={trucker.trucker_id} style={styles.card}>
                <Text style={styles.cardText}>Name: {trucker.name}</Text>
                <Text style={styles.cardText}>ID: {trucker.trucker_id}</Text>
                <Text style={styles.cardText}>📱 Phone: {trucker.phone_number}</Text>
                <Text style={[styles.cardText, styles.statusText]}>Status: {trucker.status}</Text>
              </View>
            ))}
            {truckers.length === 0 && (
              <View style={styles.card}>
                <Text style={styles.cardText}>No registered truckers</Text>
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
            activeSection === 'reimbursements' ? 'Pending Reimbursements' :
            activeSection === 'truckers' ? 'Registered Truckers' :
            'Dashboard'}</Text>
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
    backgroundColor: '#FEE2E2',
  },
  signOutText: {
    color: '#DC2626',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  statusText: {
    color: '#088395',
    fontWeight: '600',
  },
  completedText: {
    color: '#059669',
    fontWeight: '600',
  },
  pendingText: {
    color: '#D97706',
    fontWeight: '600',
  },
});

export default AdminDashboardNew;