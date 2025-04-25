import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#f9f9f9",
    },
    container: {
      padding: 20,
      paddingBottom: 40,
    },
    heading: {
      marginTop: 30,
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 30,
      textAlign: "center",
      color: "#333",
    },
    label: {
      fontSize: 16,
      marginBottom: 6,
      marginTop: 15,
      color: "#555",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      backgroundColor: "#fff",
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
    },
    buttonContainer: {
      marginTop: 30,
      backgroundColor: "#007AFF",
      borderRadius: 8,
      overflow: "hidden",
    },
    image: {
      width: 300,
      height: 300,
      marginTop: 20,
      borderRadius: 10,
      alignSelf: "center",
    },
  });
  export default styles;  