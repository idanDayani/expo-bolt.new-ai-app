import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2D3748',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#4299E1',
        tabBarInactiveTintColor: '#A0AEC0',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="code" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}