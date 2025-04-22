import React, { useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Switch,
  ScrollView,
  Platform
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';
import { getTruckerByEmail, getAdminByEmail } from '../../services/api';

const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [userType, setUserType] = React.useState('');
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const pickerRef = useRef(null);
  const dispatch = useDispatch();
  const auth = FIREBASE_AUTH;

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleClear = () => {
    setEmail('');
    setPassword('');
    setPasswordError('');
    setUserType('');
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      let userData;
      if (userType === 'admin') {
        userData = await getAdminByEmail(email);
        if (!userData) return;
        dispatch(
          setUser({
            name: userData.name,
            email: userData.email,
            id: userData.admin_id,
            isAdmin: true
          })
        );
        handleClear();
        router.push('/AdminDashboardNew');
      } else {
        const truckerData = await getTruckerByEmail(email);
        if (!truckerData) return;
        dispatch(
          setUser({
            name: truckerData.name,
            email: truckerData.email,
            id: truckerData.trucker_id,
            isAdmin: false
          })
        );
        handleClear();
        router.push('/TruckerDashboardNew');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol size={24} name="chevron.left" color="#333" />
            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/truck_rm.png')} style={styles.logo} />
            <Text style={styles.subtitleText}>Where Every Mile Matters</Text>
          </View>

          <TextInput
            value={email}
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            onChangeText={setEmail}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              secureTextEntry={!isPasswordVisible}
              value={password}
              style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
              placeholder="Password"
              autoCapitalize="none"
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color="black" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          {/* Role Selection */}
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              style={styles.fullPickerTouchable}
              activeOpacity={0.8}
              onPress={() => pickerRef.current?.focus()}
            >
              <Text style={[styles.pickerText, !userType && { color: '#A0AEC0' }]}>
                {userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'Select Role'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#202545" style={styles.pickerIcon} />
            </TouchableOpacity>

            <Picker
              ref={pickerRef}
              selectedValue={userType}
              onValueChange={(itemValue) => setUserType(itemValue)}
              style={styles.hiddenPicker}
            >
              <Picker.Item label="Select Role" value="" enabled={false} />
              <Picker.Item label="Trucker" value="trucker" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <TouchableOpacity style={styles.button} onPress={signIn}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleClear();
                  router.push('/signupForm');
                }}
              >
                <Text style={styles.signUpText}>
                  Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

// Styles
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
    color: '#088395',
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
  }
});
