import React from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button, TouchableOpacity, Image, Dimensions, SafeAreaView, Switch } from 'react-native'
import { ThemedView } from '@/components/ThemedView'

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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Import RootState
import { useEffect } from "react";

const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    const [isAdmin, setIsAdmin] = React.useState(false); // New state to track user type (admin or trucker)

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
            if (isAdmin) {
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
                // router.push("/truckerdashboard"); // Update route for trucker
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

                {/* Password Input */}
                <TextInput
                    secureTextEntry
                    value={password}
                    style={[styles.input, passwordError ? styles.inputError : null]}
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={(text) => {
                        setPassword(text)
                        validatePassword(text)
                    }}
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                {/* Admin/Trucker Switch */}
                <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Login as {isAdmin ? 'Admin' : 'Trucker'}</Text>
                    <Switch
                        value={isAdmin}
                        onValueChange={(value) => setIsAdmin(value)}
                    />
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
        </SafeAreaView>
    )
}

export default Login

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
        padding: Math.max(screenWidth * 0.05, 20),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
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
        marginBottom: Math.max(screenHeight * 0.03, 20),
        marginTop: Math.max(screenHeight * 0.05, 30),
    },
    logo: {
        width: Math.min(screenWidth * 0.6, 200),
        height: Math.min(screenWidth * 0.6, 200),
        resizeMode: 'contain',
    },
    subtitleText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#555',
        textAlign: 'center',
        marginTop: Math.max(screenHeight * 0.015, 10),
    },
    input: {
        width: '100%',
        height: Math.max(screenHeight * 0.06, 50),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        paddingHorizontal: Math.max(screenWidth * 0.03, 15),
        marginBottom: Math.max(screenHeight * 0.015, 10),
        fontSize: Math.min(screenWidth * 0.04, 16),
        backgroundColor: '#f9f9f9',
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
        height: Math.max(screenHeight * 0.06, 50),
        backgroundColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        marginVertical: Math.max(screenHeight * 0.015, 10),
    },
    signUpButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontSize: Math.min(screenWidth * 0.045, 18),
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Math.max(screenHeight * 0.02, 15),
    },
    switchLabel: {
        marginRight: Math.max(screenWidth * 0.02, 10),
        fontSize: Math.min(screenWidth * 0.04, 16),
    },
    signUpText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#555",
        marginTop: Math.max(screenHeight * 0.01, 8),
        textAlign: "center",
    },
    signUpLink: {
        color: "#007bff",
        fontWeight: "bold",
    },
})
