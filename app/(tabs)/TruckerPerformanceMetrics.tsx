import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllTruckers, Trucker } from '../../services/api';
import { useIsFocused } from "@react-navigation/native";

const TruckerPerformanceMetrics = () => {
  const [minRating, setMinRating] = useState('0');
  const [truckers, setTruckers] = useState<Trucker[]>([]);
  const [filteredTruckers, setFilteredTruckers] = useState<Trucker[]>([]);
  const [statusData, setStatusData] = useState({ active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchTruckers = async () => {
      try {
        const data = await getAllTruckers();
        setTruckers(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchTruckers();
  }, [isFocused]);

  useEffect(() => {
    const filtered = truckers
  .filter(trucker => trucker.rating >= parseInt(minRating) || 0)
  .sort((a, b) => b.rating - a.rating);
  setFilteredTruckers(filtered);


    const activeCount = truckers.filter(t => t.status === 'Active').length;
    const inactiveCount = truckers.filter(t => t.status === 'Inactive').length;
    setStatusData({ active: activeCount, inactive: inactiveCount });
  }, [minRating, truckers]);

  if (loading) return <ActivityIndicator size="large" color="#007bff" style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/AdvancedAnalytics')} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color="#071952" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trucker Performance Metrics</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bar Chart */}
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
              color: (opacity = 1) => `rgba(55, 183, 195, ${opacity})`,
              labelColor: () => '#64748B',
              propsForBars: {
                strokeWidth: 1,
                stroke: '#E2E8F0',
              },
              barPercentage: 2,
            }}
            style={{ marginTop: 8 }}
            animate
            animationDuration={1200}
          />
        </View>

        {/* Filter Section */}
        <View style={styles.filterCard}>
          <Text style={styles.sectionTitle}>Filter by Rating</Text>
          <View style={styles.filterInputGroup}>
            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <TextInput
              style={styles.filterInput}
              value={minRating}
              onChangeText={setMinRating}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>
        {filteredTruckers.map((trucker, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.routeInfo}>
              <Text style={styles.truckerName}>{trucker.name}</Text>
              <Text style={styles.truckerRating}>⭐ {trucker.rating}</Text>
            </View>
          </View>
        ))}
        </View>

        {/* Truckers List */}
      </ScrollView>
    </SafeAreaView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterInputGroup: {
    marginTop: 12,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    color: '#071952',
    fontSize: 14,
    paddingbottom: 10
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

});
