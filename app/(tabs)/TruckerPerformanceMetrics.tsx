import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BarChart } from 'react-native-chart-kit';
import { getAllTruckers, Trucker } from '../../services/api';

const TruckerPerformanceMetrics = () => {
  const [minRating, setMinRating] = useState('0');
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [filteredTruckers, setFilteredTruckers] = useState<Trucker[]>([]);
  const [statusData, setStatusData] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const data = await getAllTruckers();
        setTruckers(data);
      } catch (error) {
        console.error('Failed to fetch truckers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTruckers();
  }, []);

  useEffect(() => {
    const filtered = truckers.filter(
      (trucker) => trucker.rating >= parseInt(minRating) || 0
    );
    setFilteredTruckers(filtered);

    const activeCount = truckers.filter((t) => t.status === 'Active').length;
    const inactiveCount = truckers.filter((t) => t.status === 'Inactive').length;
    setStatusData({ active: activeCount, inactive: inactiveCount });
  }, [minRating, truckers]);

  if (loading) return <ActivityIndicator size="large" color="#071952" style={{ marginTop: 32 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#071952" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trucker Performance Metrics</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Trucker Status Distribution</Text>
          <BarChart
            data={{
              labels: ['Active', 'Inactive'],
              datasets: [{ data: [statusData.active, statusData.inactive] }],
            }}
            width={Dimensions.get('window').width - 64}
            height={220}
            fromZero
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(7, 25, 82, ${opacity})`,
              labelColor: () => '#64748B',
              propsForBars: {
                strokeWidth: 1,
                stroke: '#E2E8F0',
              },
            }}
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.routeHeader}>
            <Text style={styles.sectionTitle}>Trucker Ratings</Text>
          </View>

          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Min Rating:</Text>
            <TextInput
              style={styles.filterInput}
              value={minRating}
              onChangeText={setMinRating}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {filteredTruckers.length > 0 ? (
            filteredTruckers.map((trucker, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.routeInfo}>
                  <Text style={styles.truckerName}>{trucker.name}</Text>
                  <Text style={styles.truckerRating}>⭐ {trucker.rating}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 14, color: '#64748B' }}>
              No truckers match the filter criteria.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default TruckerPerformanceMetrics;

const styles = StyleSheet.create({
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
    paddingBottom: 32,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    marginRight: 8,
    fontSize: 16,
    color: '#64748B',
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    width: 100,
    color: '#071952',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  truckerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#071952',
  },
  truckerRating: {
    fontSize: 14,
    color: '#37B7C3',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
  },
});
