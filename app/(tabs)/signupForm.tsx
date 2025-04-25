import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { createTrucker, NewTrucker } from "../../services/api"; 
import { Picker } from '@react-native-picker/picker'; 
import { Ionicons } from '@expo/vector-icons';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');  // New state for repeat password
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordMatchError, setPasswordMatchError] = useState('');  // New error state for password mismatch

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
        validatePassword(text);  // This ensures the password is validated on change
    };
    
    const onRepeatPasswordChange = (text: string) => {
        setRepeatPassword(text);
        validatePasswordMatch(text);  // Validate match every time the repeat password changes
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
            console.log('User signed up:', userCredential.user);
            // alert('Check your emails');

            //TODO: MAKE SURE TRUCKER_ID IS MAX + 1
            const newTrucker:NewTrucker = {
                name,
                phone_number: phoneNumber,
                email,
                rating: 0, // Default rating
                status: "Inactive", // Default status
                age: parseInt(age, 10),
                gender
            };
    
            await createTrucker(newTrucker);
            console.log('Trucker entry created:', newTrucker);
            handleClear(); // Clear the input fields after successful sign-up
            router.push("/loginForm");
        } catch (error: any) {
            console.error('Error signing up:', error);
            // alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <ThemedView style={styles.container}>
                    
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => { 
                        handleClear();
                        router.back(); // Navigate back to the previous screen
                    } }>
                        <View style={styles.backButtonContent}>
                            <IconSymbol size={24} name="chevron.left" color="#333" />
                            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/truck.png')} style={styles.logo} />
                        <Text style={styles.subtitleText}>Where Every Mile Matters</Text>
                    </View>

                    {/* Input Fields */}
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
                        onChangeText={onRepeatPasswordChange}  // Trigger validation on each change
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
                    
                    {/* Gender Dropdown */}
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

                    {/* Loading Indicator or Button */}
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={signUp}>
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => { 
                        handleClear();
                        router.push('/loginForm'); // Navigate to the login form
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
//styling
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#EBF4F6',
        paddingHorizontal: Math.min(screenWidth * 0.05, 24),
        paddingTop: Platform.OS === 'ios' ? 0 : Math.min(screenHeight * 0.02, 16),
        paddingBottom: Math.min(screenHeight * 0.02, 16),
    },
    backButton: {
        paddingVertical: Math.max(screenHeight * 0.01, 8),
        marginTop: Math.max(screenHeight * 0.04, 24),
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
        marginTop: Math.min(screenHeight * 0.08, 80),
        marginBottom: Math.min(screenHeight * 0.05, 40),
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    logo: {
        width: Math.min(screenWidth * 0.9, 420),
        height: Math.min(screenHeight * 0.28, 220),
        maxWidth: '90%',
        resizeMode: 'contain',
    },
    subtitleText: {
        fontSize: 18,
        color: '#088395',
        textAlign: 'center',
        marginBottom: Math.min(screenHeight * 0.04, 32),
        fontWeight: '500',
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
        marginBottom: Math.max(screenHeight * 0.015, 10),
    },
    input: {
        backgroundColor: '#FFF',
        padding: Math.min(screenHeight * 0.018, 16),
        borderRadius: 12,
        marginVertical: 8,
        width: '100%',
        fontSize: 16,
        color: '#071952',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 12,
        zIndex: 1,
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
        backgroundColor: '#071952',
        padding: Math.min(screenHeight * 0.022, 18),
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        marginTop: Math.min(screenHeight * 0.02, 15),
        marginBottom: Math.min(screenHeight * 0.02, 15),
        minHeight: 52,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 4,
    },
    buttonText: {
        color: '#EBF4F6',
        fontSize: 18,
        fontWeight: '700',
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        padding: Math.min(screenHeight * 0.018, 16),
        borderRadius: 12,
        marginVertical: 8,
        width: '100%',
        fontSize: 16,
        color: '#071952',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    picker: {
        width: '100%',
        height: 50,
        color: '#071952',
        marginTop: -16,
        marginBottom: -16,
    },
    signUpText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#202545',
        textAlign: 'center',
        marginTop: Math.max(screenHeight * 0.015, 10),
    },
    signUpLink: {
        color: '#7F9FB4',
        fontWeight: 'bold',
    },
});