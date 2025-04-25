import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: Math.max(screenHeight * 0.025, 20),
      paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    },
    header: {
      marginBottom: Math.max(screenHeight * 0.02, 15),
    },
    backButton: {
      paddingVertical: Math.max(screenHeight * 0.012, 10),
    },
    backButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonLabel: {
      fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
      fontWeight: '500',
      marginLeft: 8,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: Math.max(screenHeight * 0.02, 15),
      marginBottom: Math.max(screenHeight * 0.03, 25),
      height: Math.min(screenHeight * 0.15, 100),
    },
    logo: {
      width: Math.min(screenWidth * 0.45, 180),
      height: '100%',
    },
    title: {
      fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
      fontWeight: '600',
      marginBottom: Math.max(screenHeight * 0.025, 20),
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: Math.max(screenHeight * 0.025, 20),
      paddingHorizontal: Math.max(screenWidth * 0.04, 16),
      paddingVertical: Math.max(screenHeight * 0.02, 16),
    },
    label: {
      fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
      marginBottom: Math.max(screenHeight * 0.012, 10),
      marginTop: Math.max(screenHeight * 0.015, 12),
      fontWeight: '500',
    },
    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: Math.max(screenHeight * 0.015, 12),
      marginBottom: Math.max(screenHeight * 0.02, 16),
      fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
      height: Math.max(screenHeight * 0.06, 48),
    },
    errorText: {
      color: '#ff3b30',
      fontSize: Math.min(Math.max(screenWidth * 0.028, 11), 13),
      marginBottom: Math.max(screenHeight * 0.008, 6),
    },
    submitButton: {
      backgroundColor: '#088395',
      borderRadius: 8,
      paddingVertical: Math.max(screenHeight * 0.012, 10),
      marginTop: Math.max(screenHeight * 0.015, 12),
      marginBottom: Math.max(screenHeight * 0.02, 16),
      marginHorizontal: Math.max(screenWidth * 0.04, 15),
    },
    submitButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
      fontWeight: '600',
    },
  });

  export default styles;