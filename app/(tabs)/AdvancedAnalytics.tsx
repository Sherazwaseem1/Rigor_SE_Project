import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Feather } from '@expo/vector-icons';
import styles from '../../assets/styles/styleAdvancedAnalytics';


const { width } = Dimensions.get('window');

const AdvancedAnalytics = () => {
  const analyticsCards = [
    {
      title: 'Trip Analytics',
      description: 'Detailed insights into trip performance and routes',
      icon: 'bar-chart-2',
    },
    {
      title: 'Trucker Performance Metrics',
      description: 'Analysis of trucker ratings and efficiency',
      icon: 'user-check',
    },
    {
      title: 'Financial Analytics',
      description: 'Cost analysis and reimbursement trends',
      icon: 'dollar-sign',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push('/AdminDashboardNew')}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced Analytics</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {analyticsCards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => {
                if (card.title === 'Trip Analytics') {
                  router.push('/TripAnalytics');
                } else if (card.title === 'Trucker Performance Metrics') {
                  router.push('/TruckerPerformanceMetrics');
                } else if (card.title === 'Financial Analytics') {
                  router.push('/FinancialAnalytics');
                } else {
                }
              }}
            >
              <Feather
                name={card.icon as any}
                size={32}
                color="#071952"
                style={styles.cardIcon}
              />
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


export default AdvancedAnalytics;
