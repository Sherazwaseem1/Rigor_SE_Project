import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native';
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
                        <Text style={styles.subtitleText}>Have a better trucking experience</Text>
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
        color: '#202545',
        textAlign: 'center',
        marginTop: Math.max(screenHeight * 0.015, 10),
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
        marginBottom: Math.max(screenHeight * 0.015, 10),
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
        color: '#202545',
        placeholderTextColor: '#202545',
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
        width: '100%',
        height: Math.max(screenHeight * 0.06, 50),
        backgroundColor: '#7F9FB4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        marginVertical: Math.max(screenHeight * 0.015, 10),
    },
    buttonText: {
        color: '#202545',
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: 'bold',
    },
    pickerContainer: {
        width: '100%',
        height: Math.max(screenHeight * 0.06, 50),
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: Math.min(screenWidth * 0.02, 8),
        marginBottom: Math.max(screenHeight * 0.015, 10),
        backgroundColor: '#f9f9f9',
    },
    picker: {
        width: '100%',
        height: '110%',
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