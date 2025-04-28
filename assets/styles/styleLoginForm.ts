import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      paddingTop: Platform.OS === 'ios' ? 40 : 20,
      paddingHorizontal: 15
    },
    scrollContainer: {
      flexGrow: 1
    },
    container: {
      flex: 1,
      padding: Math.max(screenWidth * 0.06, 24),
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      paddingTop: 0,
      paddingBottom: Math.max(screenHeight * 0.06, 48),
      borderRadius: 20,
      minHeight: screenHeight * 0.9
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: 20,
      marginBottom: 10,
      zIndex: 1
    },
    backButtonLabel: {
      fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
      color: '#1E293B',
      marginLeft: 12,
      fontWeight: '600',
      letterSpacing: 0.5
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: Math.max(screenHeight * 0.05, 40),
      marginTop: 20,
      paddingTop: Math.max(screenHeight * 0.04, 32),
      paddingBottom: Math.max(screenHeight * 0.04, 32),
      marginHorizontal: Math.max(screenWidth * 0.1, 40),
      backgroundColor: '#FFFFFF',
      padding: 32,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
      borderWidth: 1,
      borderColor: '#E5E9F0',
      overflow: 'hidden',
      width: '85%',
      alignSelf: 'center'
    },
    logo: {
      width: Math.min(screenWidth * 0.7, 300),
      height: Math.min(screenHeight * 0.2, 160),
      resizeMode: 'contain',
      transform: [{ scale: 0.95 }],
      opacity: 0.95
    },
    subtitleText: {
      fontSize: 18,
      color: '#071952',
      textAlign: 'center',
      marginTop: 10,
      fontWeight: '500'
    },
    input: {
      width: '100%',
      height: Math.max(screenHeight * 0.065, 52),
      borderWidth: 1,
      borderColor: '#E5E9F0',
      borderRadius: 12,
      paddingHorizontal: Math.max(screenWidth * 0.04, 16),
      marginBottom: Math.max(screenHeight * 0.02, 16),
      fontSize: Math.min(screenWidth * 0.04, 16),
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    passwordContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative'
    },
    passwordInput: {
      flex: 1,
      paddingRight: 50
    },
    eyeIcon: {
      position: 'absolute',
      bottom: 20,
      right: 6,
      padding: 10,
      zIndex: 1
    },
    inputError: {
      borderColor: '#FF3B30'
    },
    errorText: {
      color: '#FF3B30',
      fontSize: Math.min(screenWidth * 0.035, 14),
      alignSelf: 'flex-start',
      marginBottom: 8
    },
    button: {
      width: '100%',
      height: Math.max(screenHeight * 0.065, 52),
      backgroundColor: '#088395',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      marginTop: Math.max(screenHeight * 0.03, 24),
      marginBottom: Math.max(screenHeight * 0.02, 16),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700'
    },
    signUpText: {
      fontSize: 16,
      color: '#071952',
      marginTop: Math.max(screenHeight * 0.015, 12),
      textAlign: 'center'
    },
    signUpLink: {
      color: '#37B7C3',
      fontWeight: '700'
    },
    dropdownWrapper: {
      width: '100%',
      marginBottom: Math.max(screenHeight * 0.02, 16),
      position: 'relative'
    },
    fullPickerTouchable: {
      height: Math.max(screenHeight * 0.065, 52),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E9F0',
      paddingHorizontal: 16,
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      flexDirection: 'row',
      alignItems: 'center'
    },
    pickerText: {
      flex: 1,
      fontSize: 16,
      color: '#202545'
    },
    pickerIcon: {
      marginLeft: 10
    },
    hiddenPicker: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: 1,
      height: 1,
      opacity: 0
    }, 
  
  });

  export default styles;