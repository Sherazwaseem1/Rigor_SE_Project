import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
    header: { marginBottom: 16 },
    backButton: { flexDirection: "row", alignItems: "center" },
    backButtonContent: { flexDirection: "row", alignItems: "center" },
    backLabel: { marginLeft: 8, fontSize: 16, color: "#202545", fontWeight: "500" },
    logoContainer: { alignItems: "center", marginVertical: 24 },
    logo: { width: 200, height: 120, alignSelf: "center" },
    title: { fontSize: 24, fontWeight: "600", textAlign: "center", marginBottom: 32, color: "#202545" },
    label: { fontSize: 16, fontWeight: "500", marginBottom: 8, color: "#202545" },
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
      borderColor: "#ddd",
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: "#fff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    button: {
      backgroundColor: "#088395",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3
    },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 18 },
    clearButton: { backgroundColor: "#FF3B30" },
    errorText: { color: "#FF3B30", fontSize: 14, marginTop: -8, marginBottom: 12 }
  });

  export default styles;