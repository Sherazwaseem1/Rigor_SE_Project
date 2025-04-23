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

const { width } = Dimensions.get('window');

const AdvancedAnalytics = () => {
  const analyticsCards = [
    {
      title: 'Trip Analytics',
      description: 'Detailed insights into trip performance and routes',
      icon: '📊',
    },
    {
      title: 'Trucker Performance Metrics',
      description: 'Analysis of trucker ratings and efficiency',
      icon: '👨‍💼',
    },
    {
      title: 'Financial Analytics',
      description: 'Cost analysis and reimbursement trends',
      icon: '💰',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/AdminDashboardNew')}
          style={styles.backButton}
        >
          <IconSymbol name="chevron.left" size={24} color="#071952" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Analytics</Text>
      </View>

      {/* Cards Container */}
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
              } else {
                if (card.title === 'Trucker Performance Metrics') {
                router.push('/TruckerPerformanceMetrics');
              } else if (card.title === 'Financial Analytics') {
                router.push('/FinancialAnalytics');
              } else {
                console.log("Navigating to ${card.title}");
              }
              }
            }}
          >
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    </SafeAreaView>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#071952',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default AdvancedAnalytics;