// App.js or LoginScreen.js

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({navigation}) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Logo & Title */}
      <View style={styles.header}>
        <View style={{flexDirection:'row',alignItems:"center",alignContent:"center",alignSelf:"center"}}>

        <Image
          source={require('../assets/images/fire.png')} // Replace with your actual logo
          style={styles.logo}
          />
        <Text style={styles.title}>Fire <Text style={{ fontWeight: 'bold' }}>course</Text></Text>
          </View>
        <Text style={styles.subtitle}>Free app for learning miscellaneous things</Text>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          placeholder="Enter your name or e-mail"
          placeholderTextColor="#ccc"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
        />

        {/* Login Button */}
        <LinearGradient
          colors={['#5B38F7', '#0CC0DF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <TouchableOpacity style={styles.buttonContent} onPress={()=>{navigation.push("MainScreen")}}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Google Button */}
        <LinearGradient
          colors={['#FBB03B', '#FF6A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <TouchableOpacity style={styles.buttonContent}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Help Links */}
        <TouchableOpacity style={styles.linkContainer}>
          <Text style={styles.linkText}>Having trouble logging in?</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.signUp}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
    
  },
  title: {
    fontSize: 28,
    color: '#FFA500',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 20,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonContent: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#aaa',
    fontSize: 13,
  },
  signUp: {
    marginTop: 5,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
