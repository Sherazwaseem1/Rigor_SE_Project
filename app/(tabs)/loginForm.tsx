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
import styles from '../../assets/styles/styleLoginForm';

const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    const [userType, setUserType] = React.useState(''); 
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false); 
    const [error, setError] = React.useState('');

  const pickerRef = useRef<Picker<string> | null>(null);
  const dispatch = useDispatch();
  const auth = FIREBASE_AUTH;

  const handleClear = () => {
    setEmail('');
    setPassword('');
    setPasswordError('');
    setUserType('');
  };
  const signIn = async () => {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      alert("Please enter both email and password");
      return;
    }

    if (!userType) {
      setError("Please select a role (Trucker or Admin)");
      alert("Please select a role (Trucker or Admin)");
      return;
    }
  
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
      let userData;
      if (userType === 'admin') {
        userData = await getAdminByEmail(email);
        if (!userData) {
          setError("Admin not found");
          alert("Admin not found");
          setLoading(false);
          return;
        }
  
        dispatch(setUser({
          name: userData.name,
          email: userData.email,
          id: userData.admin_id,
          isAdmin: true,
        }));
  
        handleClear();
        router.push("/AdminDashboardNew");
      } else {
        const truckerData = await getTruckerByEmail(email);
        if (!truckerData) {
          setError("Trucker not found");
          alert("Trucker not found");
          setLoading(false);
          return;
        }
  
        dispatch(setUser({
          name: truckerData.name,
          email: truckerData.email,
          id: truckerData.trucker_id,
          isAdmin: false,
        }));
  
        handleClear();
        router.push("/TruckerDashboardNew");
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email address or password');
        alert("Invalid email or password");
      } else {
        setError('An error occurred, please try again');
        alert("Account does not exist");
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.container}>
          <TouchableOpacity onPress={() => {
            handleClear()
            router.back()
          }} style={styles.backButton}>
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
              }}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color="black" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

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
