// import React, { Component } from 'react'
// import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button } from 'react-native'
// import { FIREBASE_AUTH } from '../../firebaseConfig'
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import React from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native'
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
import { getTruckerByEmail } from "../../services/api"; // Import API function
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // Import RootState
import { useEffect } from "react";

const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [passwordError, setPasswordError] = React.useState('')
    // const user = useSelector((state: RootState) => state.user);

    // useEffect(() => {
    //     console.log("Updated User Store:", user); 
    // }, [user]); // Runs every time `user` changes


    const dispatch = useDispatch(); // Get Redux dispatch function


    const auth = FIREBASE_AUTH;

    const validatePassword = (pass: string) => {
        if (pass.length < 6) {
            setPasswordError('Password must be at least 6 characters long')
            return false
        }
        // if (!/\d/.test(pass)) {
        //     setPasswordError('Password must contain at least one number')
        //     return false
        // }
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
            // Navigate to the next screen or perform any other actions

            const truckerData = await getTruckerByEmail(email);

            if (!truckerData) {
                throw new Error("Trucker data not found");
            }

            dispatch(setUser({
                name: truckerData.name,  
                email: truckerData.email,
                id: truckerData.trucker_id,       
                isAdmin: false,           
            }));

            // router.push("/truckerdashboard"); // Navigate to the truckerdashboard
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

                {/* Loading Indicator or Buttons */}
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <TouchableOpacity style={styles.button} onPress={signIn}>
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={signUp}>
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity> */}
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
        fontWeight: 'bold',
    },
});

