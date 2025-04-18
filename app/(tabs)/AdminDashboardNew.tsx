import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Drawer } from 'react-native-drawer-layout';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { RootState } from '../../redux/store';
import { getAllTrips, getAllTruckers, getAllReimbursements, getAdminProfileImage } from '../../services/api';
import { Trip, Trucker, Reimbursement } from '../../services/api';
import { Image } from 'react-native';

const AdminDashboardNew = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const admin = useSelector((state: RootState) => state.user);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('map');
  const isFocused = useIsFocused();
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

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
                    <Text style={styles.locationLabel}>Start Location</Text>
                    <Text style={styles.locationText}>{trip.start_location}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Destination</Text>
                    <Text style={styles.locationText}>{trip.end_location}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.completedBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.completedBadgeText, { color: '#9B403D' }]}>In Progress</Text>
                  </View>
                </View>
              </View>
            ))}
            {ongoingTrips.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No ongoing trips</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'recent':
        const completedTrips = trips.filter(trip => trip.status === 'Completed');
        return (
          <ScrollView>
            {completedTrips.map(trip => (
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
                    <Text style={styles.locationLabel}>Start Location</Text>
                    <Text style={styles.locationText}>{trip.start_location}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Destination</Text>
                    <Text style={styles.locationText}>{trip.end_location}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                </View>
              </View>
            ))}
            {completedTrips.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No recent trips available</Text>
              </View>
            )}
          </ScrollView>
        );
      
      case 'reimbursements':
        const pendingReimbursements = reimbursements.filter(r => r.status === 'Pending');
        return (
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
                <View style={styles.tripDetails}>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Trip ID</Text>
                    <Text style={styles.locationText}>{item.trip_id}</Text>
                  </View>
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationLabel}>Amount</Text>
                    <Text style={styles.locationText}>$ {parseFloat(item.amount.$numberDecimal).toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[styles.completedBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.completedBadgeText, { color: '#9B403D' }]}>Pending Approval</Text>
                  </View>
                </View>
              </View>
            ))}
            {pendingReimbursements.length === 0 && (
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.emptyText}>No pending reimbursements</Text>
              </View>
            )}
          </ScrollView>
        );

      case 'truckers':
        return (
          <ScrollView>
            {truckers.map(trucker => (
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
                  <View style={[styles.statusBadge, 
                    { backgroundColor: trucker.status === 'Active' ? '#ECFDF5' : '#FEF3C7' }]}>
                    <Text style={[styles.statusBadgeText, 
                      { color: trucker.status === 'Active' ? '#047857' : '#9B403D' }]}>
                      {trucker.status === 'Active' ? '🟢 Active' : '⏳ Inactive'}
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
    marginBottom: 16,
  },
  truckerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
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
  
});


export default AdminDashboardNew;