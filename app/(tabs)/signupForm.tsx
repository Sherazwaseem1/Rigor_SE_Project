import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { createTrucker } from "../../services/api"; 
import { Picker } from '@react-native-picker/picker'; 
import { Ionicons } from '@expo/vector-icons';
import styles from '../../assets/styles/styleSignUpForm';

import {NewTrucker} from '../../services/util';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState(''); 
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');  

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);


    const auth = FIREBASE_AUTH;

    const validatePassword = (pass: string) => {
        const hasNumber = /\d/.test(pass);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        if (pass.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        } else if (!hasNumber) {
            setPasswordError('Password must contain at least one number');
            return false;
        } else if (!hasSpecialChar) {
            setPasswordError('Password must contain at least one special character');
            return false;
        }

        setPasswordError('');
        return true;
    };

    const handleClear = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRepeatPassword('');
        setPhoneNumber('');
        setAge('');
        setGender('');
        setPasswordError('');
        setPasswordMatchError('');
      };

    const onPasswordChange = (text: string) => {
        setPassword(text);
        validatePassword(text);  
    };
    
    const onRepeatPasswordChange = (text: string) => {
        setRepeatPassword(text);
        validatePasswordMatch(text);  
    };

    const validatePasswordMatch = (repeatPassword: string) => {
        if (password !== repeatPassword) {
            setPasswordMatchError('Passwords do not match');
            return false;
        } else {
            setPasswordMatchError('');
            return true;
        }
    };
    

    const signUp = async () => {
        if (!validatePassword(password) || !validatePasswordMatch(password)) return;

        if (!phoneNumber.trim()) {
            alert('Please enter your phone number');
            return;
        }

        if (!age.trim()) {
            alert('Please enter your age');
            return;
        }

        if (!gender) {
            alert('Please select a gender');
            return;
        }
        setLoading(true);
        try {
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newTrucker:NewTrucker = {
                name,
                phone_number: phoneNumber,
                email,
                rating: 1, 
                status: "Inactive", 
                age: parseInt(age, 10),
                gender
            };
    
            await createTrucker(newTrucker);
            handleClear(); 
            router.push("/loginForm");
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.container}>
                    
                    <TouchableOpacity style={styles.backButton} onPress={() => { 
                        handleClear();
                        router.back(); 
                    } }>
                            <IconSymbol size={24} name="chevron.left" color="#333" />
                            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>

                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/truck.png')} style={styles.logo} />
                        <Text style={styles.subtitleText}>Where Every Mile Matters</Text>
                    </View>

                    <TextInput value={name} style={styles.input} placeholder="Full Name" onChangeText={setName} />
                    
                    <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail} />
                    
                    <View style={styles.inputContainer}>
                    <TextInput
                            secureTextEntry={!isPasswordVisible}
                            value={password}
                            style={[styles.input, passwordError ? styles.inputError : null, { paddingRight: 50 }]}
                            placeholder="Password"
                            autoCapitalize="none"
                            onChangeText={onPasswordChange}
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

                    <View style={styles.inputContainer}>
                    <TextInput
                        secureTextEntry={!isRepeatPasswordVisible}
                        value={repeatPassword}
                        style={[styles.input, passwordMatchError ? styles.inputError : null, { paddingRight: 50 }]}
                        placeholder="Repeat Password"
                        autoCapitalize="none"
                        onChangeText={onRepeatPasswordChange}  
                    />
                    <TouchableOpacity 
                        style={styles.eyeIcon} 
                        onPress={() => setIsRepeatPasswordVisible(!isRepeatPasswordVisible)}
                    >
                        <Ionicons 
                            name={isRepeatPasswordVisible ? "eye" : "eye-off"} 
                            size={24}  
                            color="black" 
                        />
                    </TouchableOpacity>
                </View>
                {passwordMatchError ? <Text style={styles.errorText}>{passwordMatchError}</Text> : null}

                    <TextInput value={phoneNumber} style={styles.input} placeholder="Phone Number" keyboardType="numeric" onChangeText={setPhoneNumber} />
                    
                    <TextInput value={age} style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={setAge} />
                    

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={setGender}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Gender" value="" />
                            <Picker.Item label="Male" value="male" />
                            <Picker.Item label="Female" value="female" />
                            <Picker.Item label="Other" value="other" />
                        </Picker>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={signUp}>
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => { 
                        handleClear();
                        router.push('/loginForm'); 
                    }}>
                        <Text style={styles.signUpText}>
                            Already have an account? <Text style={styles.signUpLink}>Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUp;