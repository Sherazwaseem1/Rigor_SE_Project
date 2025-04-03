import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { createTrucker } from "../../services/api"; // Import API function for admin (you need to define this)


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const auth = FIREBASE_AUTH;

    const validatePassword = (pass: string) => {
        if (pass.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return false;
        }
        setPasswordError('');
        return true;
    };

    const signUp = async () => {
        if (!validatePassword(password)) return;

        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed up:', userCredential.user);
            alert('Check your emails');

            //TODO: MAKE SURE TRUCKER_ID IS MAX + 1
            const newTrucker = {
                trucker_id: Date.now(), // Generate a temporary ID (MongoDB will generate its own)
                name,
                phone_number: phoneNumber,
                email,
                rating: 0, // Default rating
                status: "active", // Default status
                age: parseInt(age, 10),
                gender
            };
    
            await createTrucker(newTrucker);
            console.log('Trucker entry created:', newTrucker);

            router.push("/loginForm");
        } catch (error: any) {
            console.error('Error signing up:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                        <Text style={styles.subtitleText}>Create your account</Text>
                    </View>

                    {/* Input Fields */}
                    <TextInput value={name} style={styles.input} placeholder="Full Name" onChangeText={setName} />
                    
                    <TextInput value={email} style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail} />
                    
                    <TextInput
                        secureTextEntry
                        value={password}
                        style={[styles.input, passwordError ? styles.inputError : null]}
                        placeholder="Password"
                        autoCapitalize="none"
                        onChangeText={(text) => {
                            setPassword(text);
                            validatePassword(text);
                        }}
                    />
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                    <TextInput value={phoneNumber} style={styles.input} placeholder="Phone Number" keyboardType="numeric" onChangeText={setPhoneNumber} />
                    
                    <TextInput value={age} style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={setAge} />
                    
                    <TextInput value={gender} style={styles.input} placeholder="Gender" onChangeText={setGender} />

                    {/* Loading Indicator or Button */}
                    {loading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={signUp}>
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity>
                    )}
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
    buttonText: {
        color: '#fff',
        fontSize: Math.min(screenWidth * 0.045, 18),
    },
});


// import React from 'react'
// import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native'
// import { ThemedView } from '@/components/ThemedView'

// const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// import { FIREBASE_AUTH } from '../../firebaseConfig'
// import { createUserWithEmailAndPassword } from 'firebase/auth'
// import { useForm, Controller } from 'react-hook-form'
// import { router } from 'expo-router'
// import { IconSymbol } from '@/components/ui/IconSymbol'
// import { ThemedText } from '@/components/ThemedText'

// const SignUp = () => {
//     const [loading, setLoading] = React.useState(false)
//     const { control, handleSubmit, formState: { errors } } = useForm({
//         defaultValues: {
//             name: '',
//             email: '',
//             password: '',
//             phoneNumber: '',
//             age: '',
//             gender: ''
//         }
//     })

//     const auth = FIREBASE_AUTH;

//     const signUp = async (data: { name: string, email: string, password: string, phoneNumber: string, age: string, gender: string }) => {
//         setLoading(true)
//         try {
//             const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
//             console.log('User signed up:', userCredential.user);
//             alert("Account Created Successfully");
//             // Navigate to the next screen or perform any other actions
//         } catch (error: any) {
//             console.error('Error signing up:', error);
//             alert(error.message);
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <SafeAreaView style={styles.safeArea}>
//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//                 <ThemedView style={styles.container}>
//                     <TouchableOpacity 
//                         style={styles.backButton}
//                         onPress={() => router.back()}
//                     >
//                         <View style={styles.backButtonContent}>
//                             <IconSymbol size={24} name="chevron.left" color="#333" />
//                             <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
//                         </View>
//                     </TouchableOpacity>
//                     <View style={styles.logoContainer}>
//                         <Image
//                             source={require('../../assets/images/truck.png')}
//                         />
//                         <Text style={styles.subtitleText}>Create your account</Text>
//                     </View>

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Name is required',
//                             minLength: {
//                                 value: 2,
//                                 message: 'Name must be at least 2 characters'
//                             }
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.name && styles.inputError]}
//                                 placeholder='Name'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="name"
//                     />
//                     {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Email is required',
//                             pattern: {
//                                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                                 message: 'Invalid email address'
//                             }
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.email && styles.inputError]}
//                                 placeholder='Email'
//                                 autoCapitalize='none'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="email"
//                     />
//                     {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Password is required',
//                             minLength: {
//                                 value: 6,
//                                 message: 'Password must be at least 6 characters'
//                             }
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.password && styles.inputError]}
//                                 placeholder='Password'
//                                 secureTextEntry
//                                 autoCapitalize='none'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="password"
//                     />
//                     {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Phone number is required',
//                             pattern: {
//                                 value: /^[0-9]{10,}$/,
//                                 message: 'Invalid phone number'
//                             }
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.phoneNumber && styles.inputError]}
//                                 placeholder='Phone Number'
//                                 keyboardType='numeric'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="phoneNumber"
//                     />
//                     {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Age is required',
//                             pattern: {
//                                 value: /^[0-9]{1,3}$/,
//                                 message: 'Invalid age'
//                             }
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.age && styles.inputError]}
//                                 placeholder='Age'
//                                 keyboardType='numeric'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="age"
//                     />
//                     {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}

//                     <Controller
//                         control={control}
//                         rules={{
//                             required: 'Gender is required'
//                         }}
//                         render={({ field: { onChange, onBlur, value } }) => (
//                             <TextInput
//                                 style={[styles.input, errors.gender && styles.inputError]}
//                                 placeholder='Gender'
//                                 onBlur={onBlur}
//                                 onChangeText={onChange}
//                                 value={value}
//                             />
//                         )}
//                         name="gender"
//                     />
//                     {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}

//                     {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
//                         <TouchableOpacity 
//                             style={styles.button}
//                             onPress={handleSubmit(signUp)}
//                         >
//                             <Text style={styles.buttonText}>Create Account</Text>
//                         </TouchableOpacity>
//                     )}
//                 </ThemedView>
//             </ScrollView>
//         </SafeAreaView>
//     )
// }

// export default SignUp

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#fff'
//     },
//     scrollContainer: {
//         flexGrow: 1,
//         paddingBottom: 20
//     },
//     container: {
//         flex: 1,
//         padding: 20,
//         width: '100%',
//         maxWidth: 500,
//         alignSelf: 'center'
//     },
//     backButton: {
//         marginBottom: 20
//     },
//     backButtonContent: {
//         flexDirection: 'row',
//         alignItems: 'center'
//     },
//     backButtonLabel: {
//         marginLeft: 8,
//         fontSize: 16
//     },
//     logoContainer: {
//         alignItems: 'center',
//         marginBottom: 60,
//         marginTop: 60
//     },
//     subtitleText: {
//         fontSize: 24,
//         fontWeight: '600',
//         marginTop: 20,
//         color: '#202545'
//     },
//     input: {
//         width: '100%',
//         height: 48,
//         borderWidth: 1,
//         borderColor: '#ddd',
//         borderRadius: 8,
//         paddingHorizontal: 15,
//         marginBottom: 10,
//         backgroundColor: '#fff'
//     },
//     inputError: {
//         borderColor: '#ff0000'
//     },
//     errorText: {
//         color: '#ff0000',
//         marginBottom: 10,
//         fontSize: 12
//     },
//     button: {
//         backgroundColor: '#7F9FB4',
//         padding: 15,
//         borderRadius: 8,
//         width: '100%',
//         alignItems: 'center',
//         marginTop: 20
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600'
//     }
// });