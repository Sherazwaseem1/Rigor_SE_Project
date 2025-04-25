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
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getAllTrips } from '../../services/api';
import type { Trip } from '../../services/api';
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const TripAnalytics = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [minTripCount, setMinTripCount] = useState<string>('0');
  const [numRoutes, setNumRoutes] = useState<string>('5');
  const [filteredRoutes, setFilteredRoutes] = useState<{route: string, count: number}[]>([]);
  const [tripStatusData, setTripStatusData] = useState<{ name: string; count: number; color: string }[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getAllTrips();
        setTrips(tripsData);
        processRoutes(tripsData);
        processTripStatus(tripsData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [isFocused]);

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

  const processTripStatus = (tripsData: Trip[]) => {
    const statusCounts = tripsData.reduce(
      (acc, trip) => {
        if (trip.status === 'Completed') acc.completed++;
        else if (trip.status === 'Scheduled') acc.scheduled++;
        return acc;
      },
      { completed: 0, scheduled: 0 }
    );

    setTripStatusData([
      {
        name: 'Completed',
        count: statusCounts.completed,
        color: '#088395'
      },
      {
        name: 'Scheduled',
        count: statusCounts.scheduled,
        color: '#37B7C3'
      }
    ]);
  };

  const processTripsData = () => {
    if (!trips.length) return { labels: [], data: [] };

    const sortedTrips = [...trips].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    const tripsByMonth = sortedTrips.reduce((acc, trip) => {
      const date = new Date(trip.start_time);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { totalDistance: 0, count: 0 };
      }
      acc[monthYear].totalDistance += trip.distance;
      acc[monthYear].count++;
      return acc;
    }, {} as Record<string, { totalDistance: number; count: number }>);

    const monthlyAverages = Object.entries(tripsByMonth).map(([month, data]) => ({
      month,
      average: data.totalDistance / data.count
    }));

    return {
      labels: monthlyAverages.map(item => item.month),
      data: monthlyAverages.map(item => Number(item.average.toFixed(2)))
    };
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
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
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Trip Status Distribution</Text>
              {tripStatusData.length > 0 && (
                <PieChart
                  data={tripStatusData.map(data => ({
                    name: data.name,
                    population: data.count,
                    color: data.color,
                    legendFontColor: '#071952',
                    legendFontSize: 12
                  }))}
                  width={width - 32}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    color: (opacity = 1) => `rgba(7, 25, 82, ${opacity})`,
                    style: {
                      borderRadius: 16
                    }
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </View>
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Longest Routes</Text>
              <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Number of Routes:</Text>
                <TextInput
                  style={styles.filterInput}
                  value={numRoutes}
                  onChangeText={setNumRoutes}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              {trips.length > 0 ? (
                trips
                  .sort((a, b) => b.distance - a.distance)
                  .slice(0, parseInt(numRoutes))
                  .map((trip, index) => (
                    <View key={index} style={styles.routeCard}>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeText}>
                          {trip.start_location} → {trip.end_location}
                        </Text>
                        <Text style={styles.routeDistance}>
                          {trip.distance} km
                        </Text>
                      </View>
                    </View>
                  ))
              ) : (
                <Text style={styles.noDataText}>No trip data available</Text>
              )}
            </View>

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
                      <Text style={styles.tripCount}>
                        {route.count} {route.count === 1 ? 'trip' : 'trips'}
                      </Text>
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
    </SafeAreaView>
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
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#071952',
    marginRight: 12,
    fontWeight: '500',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 70,
    fontSize: 14,
    color: '#071952',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  routeText: {
    fontSize: 15,
    color: '#071952',
    fontWeight: '600',
    flex: 1,
  },
  routeDistance: {
    fontSize: 14,
    color: '#088395',
    fontWeight: '500',
    marginLeft: 12,
  },
  tripCount: {
    fontSize: 14,
    color: '#088395',
    fontWeight: '500',
    backgroundColor: '#EBF4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noDataText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
});

export default TripAnalytics;
