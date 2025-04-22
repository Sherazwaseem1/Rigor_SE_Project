import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LineChart } from 'react-native-chart-kit';
import { getAllTrips } from '../../services/api';
import type { Trip } from '../../services/api';

const { width } = Dimensions.get('window');

const TripAnalytics = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTripCount, setMinTripCount] = useState<string>('0');
  const [filteredRoutes, setFilteredRoutes] = useState<{route: string, count: number}[]>([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getAllTrips();
        setTrips(tripsData);
        processRoutes(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const processRoutes = (tripsData: Trip[]) => {
    const routeCounts = tripsData.reduce((acc, trip) => {
      const route = `${trip.start_location} → ${trip.end_location}`;
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const routes = Object.entries(routeCounts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count);

    setFilteredRoutes(routes.filter(route => route.count >= parseInt(minTripCount) || 0));
  };

  useEffect(() => {
    processRoutes(trips);
  }, [minTripCount]);

  // Process trip data for the line chart
  const processTripsData = () => {
    if (!trips.length) return { labels: [], data: [] };

    // Sort trips by start time
    const sortedTrips = [...trips].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    // Group trips by month
    const tripsByMonth = sortedTrips.reduce((acc, trip) => {
      const date = new Date(trip.start_time);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear]++;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(tripsByMonth),
      data: Object.values(tripsByMonth)
    };
  };

  const { labels, data } = processTripsData();

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/AdvancedAnalytics')}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color="#071952" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Analytics</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading trip data...</Text>
          </View>
        ) : (
          <>
            {/* Line Chart Section */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Trips Over Time</Text>
              <LineChart
                data={{
                  labels,
                  datasets: [{
                    data: data.length ? data : [0],
                  }],
                }}
                width={width - 32} // Account for padding
                height={220}
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(7, 25, 82, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                style={styles.chart}
                bezier
              />
            </View>

            {/* Popular Routes Section */}
            <View style={styles.routesContainer}>
              <View style={styles.routeHeader}>
                <Text style={styles.sectionTitle}>Popular Routes</Text>
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>Min Trips:</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={minTripCount}
                    onChangeText={setMinTripCount}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
              {filteredRoutes.length > 0 ? (
                filteredRoutes.map((route, index) => (
                  <View key={index} style={styles.routeCard}>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routeText}>{route.route}</Text>
                      <Text style={styles.tripCount}>{route.count} trips</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No routes match the filter criteria</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 60,
    fontSize: 14,
    color: '#071952',
    backgroundColor: '#FFFFFF',
  },
  tripCount: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#EBF4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#071952',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  routesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 16,
  },
  routeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeText: {
    fontSize: 14,
    color: '#071952',
    fontWeight: '500',
  },
  routeDate: {
    fontSize: 12,
    color: '#64748B',
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
  },
});

export default TripAnalytics;