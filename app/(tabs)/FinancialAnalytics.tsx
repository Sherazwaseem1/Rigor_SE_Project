import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PieChart } from 'react-native-chart-kit';
import { getAllReimbursements } from '@/services/api';
import { useIsFocused } from "@react-navigation/native";
import styles from '../../assets/styles/styleFinancialAnalytics';

const { width } = Dimensions.get('window');

interface Reimbursement {
  reimbursement_id: string;
  trip_id: string;
  amount: { $numberDecimal: string };
  status: string;
  receipt_url: string;
}

const financialAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; count: number; color: string }[]>([]);
  const [amountDistribution, setAmountDistribution] = useState<{ name: string; amount: number; color: string }[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllReimbursements();
        setReimbursements(data);
        const statusCounts = data.reduce(
          (acc, reimbursement) => {
            acc[reimbursement.status] = (acc[reimbursement.status] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        setStatusDistribution([
          {
            name: 'Pending',
            count: statusCounts['Pending'] || 0,
            color: '#071952'
          },
          {
            name: 'Approved',
            count: statusCounts['Approved'] || 0,
            color: '#088395'
          }
        ]);
        const amountSums = data.reduce(
          (acc, reimbursement) => {
            const amount = parseFloat(reimbursement.amount.$numberDecimal);
            acc[reimbursement.status] = (acc[reimbursement.status] || 0) + amount;
            return acc;
          },
          {} as Record<string, number>
        );

        setAmountDistribution([
          {
            name: 'Pending',
            amount: amountSums['Pending'] || 0,
            color: '#071952'
          },
          {
            name: 'Approved',
            amount: amountSums['Approved'] || 0,
            color: '#088395'
          }
        ]);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/advancedAnalytics')}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Analytics</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#088395" />
          ) : (
            <>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Reimbursement Status Distribution</Text>
                <PieChart
                  data={statusDistribution.map(data => ({
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
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Reimbursement Amount ($) Distribution</Text>
                <PieChart
                  data={amountDistribution.map(data => ({
                    name: data.name,
                    population: data.amount,
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
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
              <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Summary Statistics</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Reimbursements</Text>
                    <Text style={styles.statValue}>{reimbursements.length}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Amount</Text>
                    <Text style={styles.statValue}>
                      ${reimbursements.reduce((sum, r) => sum + parseFloat(r.amount.$numberDecimal), 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};



export default financialAnalytics;