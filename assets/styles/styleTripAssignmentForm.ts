import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  header: {
    marginBottom: Math.max(screenHeight * 0.02, 15),
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Math.max(screenHeight * 0.025, 20),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
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
  inputContainer: {
    marginBottom: Math.max(screenHeight * 0.025, 20),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    paddingVertical: Math.max(screenHeight * 0.02, 16),
  },
  title: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
    fontWeight: '600',
    marginBottom: Math.max(screenHeight * 0.025, 20),
    textAlign: 'center',
  },
  label: {
    fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
    marginBottom: Math.max(screenHeight * 0.012, 10),
    marginTop: Math.max(screenHeight * 0.015, 12),
    fontWeight: '500', },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  picker: { height: 56, width: screenWidth - 40 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Math.max(screenHeight * 0.015, 12),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    fontSize: Math.min(Math.max(screenWidth * 0.032, 13), 15),
    height: Math.max(screenHeight * 0.06, 48),
  },
  button: {
    backgroundColor: '#088395',
    borderRadius: 8,
    paddingVertical: Math.max(screenHeight * 0.012, 10),
    marginTop: Math.max(screenHeight * 0.015, 12),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    marginHorizontal: Math.max(screenWidth * 0.04, 15),
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: Math.min(Math.max(screenWidth * 0.035, 14), 16),
    fontWeight: '600',
  },
  clearButton: { backgroundColor: "#FF3B30" },
  errorText: { color: "#FF3B30", fontSize: 14, marginTop: -8, marginBottom: 12 }
});

export default styles;