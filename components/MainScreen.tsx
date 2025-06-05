// App.js or RootLayout.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DashboardScreen from "./DashboardScreen";
import { View, Text } from "react-native";
const Tab = createBottomTabNavigator();

export default function MainScreen() {
  return (
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#1e1e1e",
            borderTopColor: "transparent",
          },
          tabBarActiveTintColor: "#FFA500",
          tabBarInactiveTintColor: "#888",
        }}
      >
        <Tab.Screen
          name="Home"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Search"
          component={DummyScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Video"
          component={DummyScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="play-circle" color={color} size={size} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={DummyScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
  );
}

// Dummy screens for other tabs
function DummyScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
      }}
    >
      <Text style={{ color: "white" }}>Coming Soon!</Text>
    </View>
  );
}
