import { StyleSheet, Dimensions, PixelRatio, Platform } from 'react-native';

const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
    modal: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 25,
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
    },
    button: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

  export default styles;