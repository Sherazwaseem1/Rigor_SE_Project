import React from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button, TouchableOpacity, Image, Dimensions, SafeAreaView, Switch, ScrollView } from 'react-native'
import { ThemedView } from '@/components/ThemedView'
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useForm, Controller } from 'react-hook-form'
import { router } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { ThemedText } from '@/components/ThemedText'

import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slices/userSlice"; // Import setUser action
import { getTruckerByEmail } from "../../services/api"; // Import API function for trucker
import { getAdminByEmail } from "../../services/api"; // Import API function for admin (you need to define this)


const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    const [userType, setUserType] = React.useState('trucker'); // New state for dropdown
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false); // Password visibility state

    const dispatch = useDispatch(); // Get Redux dispatch function

    const auth = FIREBASE_AUTH;

    const validatePassword = (pass: string) => {
        if (pass.length < 6) {
            setPasswordError('Password must be at least 6 characters long')
            return false
        }
        setPasswordError('')
        return true
    }

    const signIn = async () => {
        if (!validatePassword(password)) return
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);
            alert("SIGNED IN YAYY");

            let userData;
            if (userType === 'admin') {
                // Fetch admin data
                userData = await getAdminByEmail(email); // Define the getAdminByEmail function
                if (!userData) {
                    alert("Admin not found");
                    return;
                }
                dispatch(setUser({
                    name: userData.name,  
                    email: userData.email,
                    id: userData.admin_id,  
                    isAdmin: true,           
                }));
                // Navigate to admin dashboard
                router.push("/AdminDashboard"); // Update route for admin
            } else {
                // Fetch trucker data
                const truckerData = await getTruckerByEmail(email);
                if (!truckerData) {
                    alert("Trucker not found");
                    return
                }
                dispatch(setUser({
                    name: truckerData.name,  
                    email: truckerData.email,
                    id: truckerData.trucker_id,   
                    isAdmin: false,           
                }));
                // Navigate to trucker dashboard
                alert("Trucker INCOMING");
                router.push("/TruckerDashboard"); // Update route for trucker
            }
        } catch (error: any) {
            console.error('Error signing in:', error);
            alert("ABEYY SALAY");
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={styles.container}>
                
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <View style={styles.backButtonContent}>
                        <IconSymbol size={24} name="chevron.left" color="#333" />
                        <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
                    </View>
                </TouchableOpacity>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/truck.png')} style={styles.logo} />
                    <Text style={styles.subtitleText}>Have a better trucking experience</Text>
                </View>

                {/* Email Input */}
                <TextInput
                    value={email}
                    style={[styles.input]}
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                />

                {/* Password Input with Show/Hide Toggle */}
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
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Ionicons 
                            name={isPasswordVisible ? "eye" : "eye-off"} 
                            size={24}  
                            color="black" 
                        />
                    </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {/* Admin/Trucker Dropdown */}
                <View style={styles.dropdownContainer}>
                    <Text style={styles.dropdownLabel}>Login as:</Text>
                    <Picker
                        selectedValue={userType}
                        onValueChange={(itemValue) => setUserType(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Trucker" value="trucker" />
                        <Picker.Item label="Admin" value="admin" />
                    </Picker>
                </View>

                {/* Loading Indicator or Buttons */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={signIn}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push("/signupForm")}>
                            <Text style={styles.signUpText}>
                                Don't have an account? <Text style={styles.signUpLink}>Sign up</Text>
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </ThemedView>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: Math.max(screenWidth * 0.06, 24),
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingTop: Math.max(screenHeight * 0.08, 60),
        paddingBottom: Math.max(screenHeight * 0.05, 40),
    },
    backButton: {
        position: 'absolute',
        top: Math.max(screenHeight * 0.03, 20),
        left: Math.max(screenWidth * 0.05, 20),
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonLabel: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        marginLeft: Math.max(screenWidth * 0.01, 5),
        color: '#333',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Math.max(screenHeight * 0.002, 6),
        marginTop: Math.max(screenHeight * 0.02, 15),
    },
    logo: {
        width: Math.min(screenWidth * 0.6, 200),
        height: Math.min(screenWidth * 0.6, 200),
        resizeMode: 'contain',
    },
    subtitleText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#202545',
        textAlign: 'center',
        marginTop: Math.max(screenHeight * 0.001, 1),
    },
    input: {
        width: '100%',
        height: Math.max(screenHeight * 0.065, 52),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        paddingHorizontal: Math.max(screenWidth * 0.04, 16),
        marginBottom: Math.max(screenHeight * 0.02, 16),
        fontSize: Math.min(screenWidth * 0.04, 16),
        backgroundColor: '#f9f9f9',
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative', // Ensure the child absolute positioning works
    },
    passwordInput: {
        flex: 1,
        paddingRight: 50, // Increase right padding so text doesn’t overlap with the icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,  // Adjust position inside the input field
        zIndex: 1,  // Ensure it appears on top of the input field
        padding: 10, // Add padding to make it easier to tap
        bottom: 13, // Adjust position inside the input field
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: Math.min(screenWidth * 0.035, 14),
        alignSelf: 'flex-start',
    },
    button: {
        width: '100%',
        height: Math.max(screenHeight * 0.065, 52),
        backgroundColor: '#7F9FB4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        marginTop: Math.max(screenHeight * 0.03, 24),
        marginBottom: Math.max(screenHeight * 0.02, 16),
    },
    signUpButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#202545',
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: 'bold'
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Math.max(screenHeight * 0.03, 24),
        marginTop: Math.max(screenHeight * 0.01, 8),
    },
    switchLabel: {
        marginRight: Math.max(screenWidth * 0.02, 10),
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#202545',
    },
    signUpText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#202545",
        marginTop: Math.max(screenHeight * 0.015, 12),
        textAlign: "center",
    },
    signUpLink: {
        color: "#7F9FB4",
        fontWeight: "bold",
    },
    dropdownContainer: {
        width: '100%',
        marginBottom: Math.max(screenHeight * 0.03, 24),
    },
    dropdownLabel: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#202545',
        marginBottom: Math.max(screenHeight * 0.01, 8),
    },
    picker: {
        height: Math.max(screenHeight * 0.065, 52),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        backgroundColor: '#f9f9f9',
    },
})
