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


const Login = () => {
    const [loading, setLoading] = React.useState(false)
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const auth = FIREBASE_AUTH;

    const signIn = async (data: { email: string, password: string }) => {
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            alert("Signed IN");
            console.log('User signed in:', userCredential.user);
            // Navigate to the next screen or perform any other actions
        } catch (error: any) {
            console.error('Error signing in:', error);
            alert(error.message);
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (data: { email: string, password: string }) => {
        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            console.log('User signed up:', userCredential.user);
            alert("Signed UP");
            // Navigate to the next screen or perform any other actions
        } catch (error: any) {
            console.error('Error signing up:', error);
            alert(error.message);
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ThemedView style={styles.container}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <View style={styles.backButtonContent}>
                        <IconSymbol size={24} name="chevron.left" color="#333" />
                        <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
                    </View>
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/truck.png')}
                    />
                    <Text style={styles.subtitleText}>Have a better trucking experience</Text>
                </View>
                <Controller
                    control={control}
                    rules={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                        }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder='Email'
                            autoCapitalize='none'
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="email"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                <Controller
                    control={control}
                    rules={{
                        required: 'Password is required',
                        minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                        }
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder='Password'
                            secureTextEntry
                            autoCapitalize='none'
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="password"
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
                    <>
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={handleSubmit(signIn)}
                        >
                            <Text style={styles.buttonText}>Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.button, styles.signUpButton]}
                            onPress={handleSubmit(signUp)}
                        >
                            <Text style={styles.buttonText}>Create Account</Text>
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
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: screenWidth * 0.05,
        paddingTop: Math.max(screenHeight * 0.05, 20),
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: Math.max(screenHeight * 0.05, 20),
        left: screenWidth * 0.05,
        zIndex: 1,
        padding: Math.min(screenWidth * 0.025, 15),
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonLabel: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#333',
        marginBottom: screenHeight * 0.004,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: Math.min(screenHeight * 0.15, 120),
        marginBottom: Math.min(screenHeight * 0.1, 80),
    },
    subtitleText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: '#666',
        marginTop: screenHeight * 0.02,
    },
    oldContainer: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: screenWidth * 0.05,
    },
    input: {
        marginVertical: screenHeight * 0.01,
        height: Math.min(screenHeight * 0.07, 50),
        borderWidth: 1,
        borderRadius: Math.min(screenWidth * 0.02, 8),
        padding: Math.min(screenWidth * 0.03, 12),
        backgroundColor: '#fff',
        borderColor: '#ccc',
        fontSize: Math.min(screenWidth * 0.04, 16),
        width: '100%',
    },
    inputError: {
        borderColor: '#ff0000'
    },
    errorText: {
        color: '#ff0000',
        fontSize: Math.min(screenWidth * 0.035, 14),
        marginBottom: screenHeight * 0.01,
        marginLeft: screenWidth * 0.02,
    },
    button: {
        backgroundColor: '#202545',
        padding: Math.min(screenHeight * 0.02, 15),
        borderRadius: Math.min(screenWidth * 0.02, 8),
        marginVertical: screenHeight * 0.01,
        alignItems: 'center',
        width: '100%',
        minHeight: 48,
    },
    signUpButton: {
        backgroundColor: '#7F9FB4'
    },
    buttonText: {
        color: '#fff',
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: 'bold'
    }
});
