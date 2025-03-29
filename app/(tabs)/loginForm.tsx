import React, { Component } from 'react'
import { Text, View, StyleSheet, TextInput, ActivityIndicator, Button } from 'react-native'
import { FIREBASE_AUTH } from '../../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'


const Login = () => {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true)
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert("Singed IN");
            console.log('User signed in:', userCredential.user);
            // Navigate to the next screen or perform any other actions
        } catch (error: any) {
            console.error('Error signing in:', error);
            alert(error.message);
        } finally {
            setLoading(false)
        }
    }

    const signUp = async () => {
        setLoading(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User signed in:', userCredential.user);
            alert("Singed UP");
            // Navigate to the next screen or perform any other actions
        } catch (error: any) {
            console.error('Error signing in:', error);
            alert(error.message);
        } finally {
            setLoading(false)
        }
    }

    return (
        <View style={styles.container}>
            <TextInput
                value={email}
                style={styles.input}
                placeholder='Email'
                autoCapitalize='none'
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput
                secureTextEntry={true}
                value={password}
                style={styles.input}
                placeholder='Password'
                autoCapitalize='none'
                onChangeText={(text) => setPassword(text)}
            />

            {loading ? <ActivityIndicator size="large" color="#0000ff" />
            : <>
                <Button title='Login' onPress={() => signIn()} />
                <Button title='Create Account' onPress={() => signUp()} />
            </> }
        </View>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 20,
    },
    input: {
        marginVertical: 4, 
        height: 50,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10, 
        backgroundColor: '#fff',

    }
});
