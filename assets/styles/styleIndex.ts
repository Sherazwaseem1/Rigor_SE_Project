import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.3;

const getScale = () => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
};

const normalize = (size:int) => {
  const scale = getScale();
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const styles = StyleSheet.create({
  truckContainer: {
    position: 'relative',
    height: SCREEN_HEIGHT * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    flex: 0.2,
  },
  truckImage: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_HEIGHT * 0.1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.02 : SCREEN_HEIGHT * 0.04,
    paddingBottom: SCREEN_HEIGHT * 0.02,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    flex: 0.3,
    justifyContent: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_HEIGHT * 0.15,
    maxWidth: '90%',
  },
  welcomeText: {
    fontSize: normalize(32),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Math.min(SCREEN_HEIGHT * 0.05, 20),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.02, 12),
    color: '#071952',
    textShadowColor: 'rgba(7, 25, 82, 0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: normalize(18),
    color: '#088395',
    textAlign: 'center',
    marginBottom: Math.min(SCREEN_HEIGHT * 0.04, 32),
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: SCREEN_HEIGHT * 0.02,
    flex: 0.3,
  },
  createAccountButton: {
    backgroundColor: '#071952',
    padding: Math.min(SCREEN_HEIGHT * 0.022, 18),
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    display: 'flex',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  createAccountButtonText: {
    color: '#EBF4F6',
    fontSize: normalize(18),
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: '#088395',
    padding: Math.min(SCREEN_HEIGHT * 0.022, 18),
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: Math.min(SCREEN_HEIGHT * 0.02, 15),
    marginBottom: Math.min(SCREEN_HEIGHT * 0.15, 60),
    minHeight: 52,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  loginButtonText: {
    color: '#EBF4F6',
    fontSize: normalize(18),
    fontWeight: '700',
  },
});

export default styles;