import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: Math.min(screenWidth * 0.05, 24),
        paddingTop: Platform.OS === 'ios' ? 0 : Math.min(screenHeight * 0.02, 16),
        paddingBottom: Math.min(screenHeight * 0.02, 16),
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 20,
        marginBottom: 10,
        zIndex: 1
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center'
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
        maxWidth: '80%',
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
    inputContainer: {
        width: '100%',
        position: 'relative',
        marginBottom: Math.max(screenHeight * 0.02, 16)
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
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -12 }],
        zIndex: 1,
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
        backgroundColor: '#071952',
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
    pickerContainer: {
        width: '100%',
        height: Math.max(screenHeight * 0.065, 52),
        borderWidth: 1,
        borderColor: '#E5E9F0',
        borderRadius: 12,
        marginBottom: Math.max(screenHeight * 0.02, 16),
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        justifyContent: 'center'
    },
    picker: {
        width: '100%',
        height: 52,
        color: '#000000'
    },
    signUpText: {
        fontSize: 16,
        color: '#071952',
        marginTop: Math.max(screenHeight * 0.015, 12),
        textAlign: 'center'
    },
    signUpLink: {
        color: '#071952',
        fontWeight: '700'
    }
});

export default styles;