import React from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native'
import { ThemedView } from '@/components/ThemedView'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useForm, Controller } from 'react-hook-form'
import { router } from 'expo-router'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { ThemedText } from '@/components/ThemedText'

const SignUp = () => {
    const [loading, setLoading] = React.useState(false)
    const { control, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phoneNumber: '',
            age: '',
            gender: ''
        }
    })

    const auth = FIREBASE_AUTH;

    const signUp = async (data: { name: string, email: string, password: string, phoneNumber: string, age: string, gender: string }) => {
        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            console.log('User signed up:', userCredential.user);
            alert("Account Created Successfully");
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
            <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                        <Text style={styles.subtitleText}>Create your account</Text>
                    </View>

                    <Controller
                        control={control}
                        rules={{
                            required: 'Name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder='Name'
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="name"
                    />
                    {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

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

                    <Controller
                        control={control}
                        rules={{
                            required: 'Phone number is required',
                            pattern: {
                                value: /^[0-9]{10,}$/,
                                message: 'Invalid phone number'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.phoneNumber && styles.inputError]}
                                placeholder='Phone Number'
                                keyboardType='numeric'
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="phoneNumber"
                    />
                    {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber.message}</Text>}

                    <Controller
                        control={control}
                        rules={{
                            required: 'Age is required',
                            pattern: {
                                value: /^[0-9]{1,3}$/,
                                message: 'Invalid age'
                            }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.age && styles.inputError]}
                                placeholder='Age'
                                keyboardType='numeric'
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="age"
                    />
                    {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}

                    <Controller
                        control={control}
                        rules={{
                            required: 'Gender is required'
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.gender && styles.inputError]}
                                placeholder='Gender'
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="gender"
                    />
                    {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}

                    {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={handleSubmit(signUp)}
                        >
                            <Text style={styles.buttonText}>Create Account</Text>
                        </TouchableOpacity>
                    )}
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20
    },
    container: {
        flex: 1,
        padding: 20,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center'
    },
    backButton: {
        marginBottom: 20
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    backButtonLabel: {
        marginLeft: 8,
        fontSize: 16
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
        marginTop: 60
    },
    subtitleText: {
        fontSize: 24,
        fontWeight: '600',
        marginTop: 20,
        color: '#202545'
    },
    input: {
        width: '100%',
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#fff'
    },
    inputError: {
        borderColor: '#ff0000'
    },
    errorText: {
        color: '#ff0000',
        marginBottom: 10,
        fontSize: 12
    },
    button: {
        backgroundColor: '#7F9FB4',
        padding: 15,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});