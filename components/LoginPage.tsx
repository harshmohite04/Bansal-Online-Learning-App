// App.js or LoginScreen.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen({navigation}:any) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const endpoint = isLogin ? '/api/signin' : '/api/signup';
      // Use your computer's IP address instead of localhost
      const response = await fetch(`https://bansal-online-learning-app.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Login/Signup response:', data);
      if (response.ok) {
        if (data.user && data.user.id) {
          await AsyncStorage.setItem('userId', data.user.id);
          console.log('User ID stored:', data.user.id);
          const userId = await AsyncStorage.getItem('userId');
          console.log('User ID retrieved:', userId);
        } else {
          alert('User ID not found in response!');
          return;
        }
        navigation.push("MainScreen");
      } else {
        // Handle error
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Logo & Title */}
      <View style={styles.header}>
        <View style={{flexDirection:'row',alignItems:"center",alignContent:"center",alignSelf:"center"}}>
          <Image
            source={require('../assets/images/fire.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Fire <Text style={{ fontWeight: 'bold' }}>course</Text></Text>
        </View>
        <Text style={styles.subtitle}>Free app for learning miscellaneous things</Text>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        {!isLogin && (
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#ccc"
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
        )}
        <TextInput
          placeholder="Enter your e-mail"
          placeholderTextColor="#ccc"
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
        />

        {/* Login/Signup Button */}
        <LinearGradient
          colors={['#5B38F7', '#0CC0DF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <TouchableOpacity style={styles.buttonContent} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Help Links */}
        {isLogin && (
          <TouchableOpacity style={styles.linkContainer}>
            <Text style={styles.linkText}>Having trouble logging in?</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.signUp}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </Text>
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
