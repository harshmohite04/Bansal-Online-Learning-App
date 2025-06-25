import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ProfileScreen = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    rating: 0,
    instructor: '',
    level: '',
    icon: '',
    category: '',
    youtubePlaylistId: '',
  });
  const [editCourseId, setEditCourseId] = useState<string | null>(null);

  const menuItems = [
    { title: 'Account Settings', icon: 'chevron-forward' },
    { title: 'Account Security', icon: 'chevron-forward' },
    { title: 'Email notification preferences', icon: 'chevron-forward' },
    { title: 'Learning reminders', icon: 'chevron-forward' },
    { title: 'About Sinau', icon: 'chevron-forward' },
    { title: 'Frequently asked questions', icon: 'chevron-forward' },
    { title: 'Share Fire course app', icon: 'chevron-forward' },
  ];

  useEffect(() => {
    AsyncStorage.getItem('userRole').then(role => {
      console.log(role);
      
      setUserRole(role);
      setShowAdmin(role === 'admin');
      if (role === 'admin') fetchCourses();
    });
    
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('https://bansal-online-learning-app.onrender.com/api/courses');
      const data = await res.json();
      setAdminCourses(data);
    } catch (e) {
      setAdminCourses([]);
    }
  };

  const handleCreateOrUpdate = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const method = editCourseId ? 'PUT' : 'POST';
    const url = editCourseId
      ? `https://bansal-online-learning-app.onrender.com/api/admin/courses/${editCourseId}`
      : 'https://bansal-online-learning-app.onrender.com/api/admin/courses';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId || '',
        },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        setNewCourse({ title: '', description: '', price: '', rating: 0, instructor: '', level: '', icon: '', category: '', youtubePlaylistId: '' });
        setEditCourseId(null);
        fetchCourses();
      } else {
        Alert.alert('Error', 'Failed to save course');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save course');
    }
  };

  const handleEdit = (course: any) => {
    setEditCourseId(course._id);
    setNewCourse({
      title: course.title,
      description: course.description,
      price: course.price,
      rating: course.rating,
      instructor: course.instructor,
      level: course.level,
      icon: course.icon,
      category: course.category,
      youtubePlaylistId: course.youtubePlaylistId || '',
    });
  };

  const handleDelete = async (id: string) => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: {
          'user-id': userId || '',
        },
      });
      if (res.ok) fetchCourses();
      else Alert.alert('Error', 'Failed to delete course');
    } catch (e) {
      Alert.alert('Error', 'Failed to delete course');
    }
  };

  const renderMenuItem = (item: { title: string; icon: string }, index: number) => (
    <TouchableOpacity key={index} style={styles.menuItem}>
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name={item.icon as any} size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('../assets/images/fire.png')}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>Mahmoud Sayed</Text>
              <Ionicons name="checkmark-circle" size={20} color="#4A90E2" />
            </View>
            <Text style={styles.email}>mahmouds@gmail.com</Text>
          </View>
        </View>

        {/* Admin Section */}
        {showAdmin && (
          <View style={{ marginVertical: 30, backgroundColor: '#222', borderRadius: 12, padding: 16 }}>
            <Text style={{ color: '#FFA500', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Admin: Manage Courses</Text>
            {/* Create/Edit Form */}
            <TextInput placeholder="Title" value={newCourse.title} onChangeText={v => setNewCourse({ ...newCourse, title: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Description" value={newCourse.description} onChangeText={v => setNewCourse({ ...newCourse, description: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Price" value={newCourse.price} onChangeText={v => setNewCourse({ ...newCourse, price: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Rating" value={String(newCourse.rating)} onChangeText={v => setNewCourse({ ...newCourse, rating: Number(v) })} style={styles.input} placeholderTextColor="#aaa" keyboardType="numeric" />
            <TextInput placeholder="Instructor" value={newCourse.instructor} onChangeText={v => setNewCourse({ ...newCourse, instructor: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Level" value={newCourse.level} onChangeText={v => setNewCourse({ ...newCourse, level: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Icon (emoji)" value={newCourse.icon} onChangeText={v => setNewCourse({ ...newCourse, icon: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="Category" value={newCourse.category} onChangeText={v => setNewCourse({ ...newCourse, category: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TextInput placeholder="YouTube Playlist ID" value={newCourse.youtubePlaylistId} onChangeText={v => setNewCourse({ ...newCourse, youtubePlaylistId: v })} style={styles.input} placeholderTextColor="#aaa" />
            <TouchableOpacity style={{ backgroundColor: '#4A90E2', borderRadius: 8, padding: 12, marginTop: 10 }} onPress={handleCreateOrUpdate}>
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{editCourseId ? 'Update' : 'Create'} Course</Text>
            </TouchableOpacity>
            {editCourseId && (
              <TouchableOpacity style={{ backgroundColor: '#888', borderRadius: 8, padding: 12, marginTop: 10 }} onPress={() => { setEditCourseId(null); setNewCourse({ title: '', description: '', price: '', rating: 0, instructor: '', level: '', icon: '', category: '', youtubePlaylistId: '' }); }}>
                <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel Edit</Text>
              </TouchableOpacity>
            )}
            {/* List Courses */}
            <FlatList
              data={adminCourses}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <View style={{ backgroundColor: '#333', borderRadius: 8, padding: 10, marginVertical: 6 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.title}</Text>
                  <Text style={{ color: '#aaa' }}>{item.description}</Text>
                  <Text style={{ color: '#FFA500' }}>Price: {item.price}</Text>
                  <Text style={{ color: '#aaa' }}>Playlist: {item.youtubePlaylistId}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <TouchableOpacity style={{ marginRight: 15 }} onPress={() => handleEdit(item)}>
                      <Text style={{ color: '#4A90E2' }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                      <Text style={{ color: '#ff4444' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {menuItems.slice(0, 3).map(renderMenuItem)}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {menuItems.slice(3).map(renderMenuItem)}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  email: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  activeNavItem: {
    // Active state styling
  },
  navLabel: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 2,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    marginBottom: 10,
    backgroundColor: '#222',
  },
});

export default ProfileScreen;