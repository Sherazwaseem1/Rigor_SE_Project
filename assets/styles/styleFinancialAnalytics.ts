import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

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
      fontSize: 16,
      fontWeight: '600',
      color: '#071952',
      marginBottom: 16,
      textAlign: 'center',
    },
    statsContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#071952',
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statCard: {
      flex: 1,
      backgroundColor: '#F8FAFC',
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#64748B',
      marginBottom: 4,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: '#071952',
    },
  });

export default styles;