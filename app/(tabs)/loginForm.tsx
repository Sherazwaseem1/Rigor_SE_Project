import React from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button, TouchableOpacity, Image, Dimensions, SafeAreaView, Switch, ScrollView, Platform } from 'react-native'
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
import { setUser } from "@/redux/slices/userSlice"; 
import { getTruckerByEmail } from "../../services/api"; 
import { getAdminByEmail } from "../../services/api"; 


const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    const [userType, setUserType] = React.useState(''); // New state for dropdown
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

    const handleClear = () => {
        setEmail("");
        setPassword("");
        setPasswordError("");
        setUserType(""); 
      };

    const signIn = async () => {
        // if (!validatePassword(password)) return

        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            let userData;
            if (userType === 'admin') {
                // Fetch admin data
                userData = await getAdminByEmail(email); // Define the getAdminByEmail function
                if (!userData) {
                    // alert("Admin not found");
                    return;
                }
                dispatch(setUser({
                    name: userData.name,  
                    email: userData.email,
                    id: userData.admin_id,  
                    isAdmin: true,           
                }));
                // Navigate to admin dashboard
                handleClear(); // Clear the form after successful login
                router.push("/AdminDashboardNew"); // Update route for admin
            } else {
                // Fetch trucker data
                const truckerData = await getTruckerByEmail(email);
                if (!truckerData) {
                    // alert("Trucker not found");
                    return
                }
                dispatch(setUser({
                    name: truckerData.name,  
                    email: truckerData.email,
                    id: truckerData.trucker_id,   
                    isAdmin: false,           
                }));
                // Navigate to trucker dashboard
                handleClear();
                // alert("Trucker INCOMING");
                router.push("/TruckerDashboardNew"); // Update route for trucker
            }
        } catch (error: any) {
            console.error('Error signing in:', error);
            // alert("ABEYY SALAY");
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol size={24} name="chevron.left" color="#333" />
                    <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
                </TouchableOpacity>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/truck_rm.png')} style={styles.logo} />
                    <Text style={styles.subtitleText}>Where Every Mile Matters</Text>
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

                {/* Role Selection Dropdown */}
                <View style={styles.dropdownContainer}>
                    <Picker
                        selectedValue={userType}
                        onValueChange={(itemValue) => setUserType(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Role" value="" enabled={false} style={{color: '#A0AEC0'}} />
                        <Picker.Item label="Trucker" value="trucker" style={{color: '#202545'}} />
                        <Picker.Item label="Admin" value="admin" style={{color: '#202545'}} />
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
                                <TouchableOpacity onPress={() => {
                                    handleClear();
                                    router.push("/signupForm")
                                }}>
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
//styling
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
        minHeight: screenHeight * 0.9,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginTop: 20,
        marginBottom: 10,
        zIndex: 1,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonLabel: {
        fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
        color: '#1E293B',
        marginLeft: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
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
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
        borderWidth: 1,
        borderColor: '#E5E9F0',
        overflow: 'hidden',
        width: '85%',
        alignSelf: 'center',
    },
    logo: {
        width: Math.min(screenWidth * 0.7, 300),
        height: Math.min(screenHeight * 0.2, 160),
        resizeMode: 'contain',
        transform: [{ scale: 0.95 }],
        opacity: 0.95,
    },
    subtitleText: {
        fontSize: 18,
        color: '#071952',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '500',
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
        elevation: 1,
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        bottom: 20,
        right: 6,
        padding: 10,
        zIndex: 1,
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: Math.min(screenWidth * 0.035, 14),
        alignSelf: 'flex-start',
        marginBottom: 8,
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
        elevation: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    signUpText: {
        fontSize: 16,
        color: "#071952",
        marginTop: Math.max(screenHeight * 0.015, 12),
        textAlign: "center",
    },
    signUpLink: {
        color: "#088395",
        fontWeight: "700",
    },
    dropdownContainer: {
        width: '100%',
        marginBottom: Math.max(screenHeight * 0.02, 16),
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E9F0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        height: Math.max(screenHeight * 0.065, 52),
    },
    picker: {
        width: '100%',
        height: Math.max(screenHeight * 0.065, 52),
        backgroundColor: '#FFFFFF',
        color: ({ focused, value }) => value ? '#202545' : '#A0AEC0',
        fontSize: Math.min(screenWidth * 0.04, 16),
    },
})
