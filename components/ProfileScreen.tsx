import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const TABS = ['All Courses', 'Create/Edit Course', 'Manage Users'];

const ProfileScreen = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    price: '',
    rating: '',
    instructor: '',
    level: '',
    icon: '',
    category: '',
    youtubePlaylistId: '',
  });
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userActionToast, setUserActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    setLoading(true);
    try {
      const res = await fetch('https://bansal-online-learning-app.onrender.com/api/courses');
      const data = await res.json();
      setAdminCourses(data);
    } catch (e) {
      setAdminCourses([]);
    }
    setLoading(false);
  };

  const handleCreateOrUpdate = async () => {
    // Validation
    if (!newCourse.title || !newCourse.description || !newCourse.price || !newCourse.instructor || !newCourse.level || !newCourse.icon || !newCourse.category) {
      setToast({ type: 'error', message: 'Please fill all required fields.' });
      return;
    }
    if (newCourse.rating && (Number(newCourse.rating) < 0 || Number(newCourse.rating) > 5)) {
      setToast({ type: 'error', message: 'Rating must be between 0 and 5.' });
      return;
    }
    setLoading(true);
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
        body: JSON.stringify({ ...newCourse, rating: Number(newCourse.rating) }),
      });
      if (res.ok) {
        setNewCourse({ title: '', description: '', price: '', rating: '', instructor: '', level: '', icon: '', category: '', youtubePlaylistId: '' });
        setEditCourseId(null);
        fetchCourses();
        setActiveTab(0);
        setToast({ type: 'success', message: editCourseId ? 'Course updated!' : 'Course created!' });
      } else {
        setToast({ type: 'error', message: 'Failed to save course.' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to save course.' });
    }
    setLoading(false);
  };

  const handleEdit = (course: any) => {
    setEditCourseId(course._id);
    setNewCourse({
      title: course.title,
      description: course.description,
      price: course.price,
      rating: String(course.rating),
      instructor: course.instructor,
      level: course.level,
      icon: course.icon,
      category: course.category,
      youtubePlaylistId: course.youtubePlaylistId || '',
    });
    setActiveTab(1);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setModalVisible(true);
  };

  const confirmDelete = async () => {
    setModalVisible(false);
    setLoading(true);
    const userId = await AsyncStorage.getItem('userId');
    try {
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/admin/courses/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'user-id': userId || '',
        },
      });
      if (res.ok) {
        fetchCourses();
        setToast({ type: 'success', message: 'Course deleted!' });
      } else {
        setToast({ type: 'error', message: 'Failed to delete course.' });
      }
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to delete course.' });
    }
    setLoading(false);
    setDeleteId(null);
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch('https://bansal-online-learning-app.onrender.com/api/admin/users', {
        headers: { 'user-id': userId || '' },
      });
      const data = await res.json();
      setAdminUsers(data);
    } catch (e) {
      setAdminUsers([]);
    }
    setUserLoading(false);
  };

  const handlePromote = async (id: string) => {
    setUserLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/admin/users/${id}/promote`, {
        method: 'POST',
        headers: { 'user-id': userId || '' },
      });
      if (res.ok) {
        setUserActionToast({ type: 'success', message: 'User promoted to admin.' });
        fetchUsers();
      } else {
        setUserActionToast({ type: 'error', message: 'Failed to promote user.' });
      }
    } catch (e) {
      setUserActionToast({ type: 'error', message: 'Failed to promote user.' });
    }
    setUserLoading(false);
  };

  const handleDemote = async (id: string) => {
    setUserLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/admin/users/${id}/demote`, {
        method: 'POST',
        headers: { 'user-id': userId || '' },
      });
      if (res.ok) {
        setUserActionToast({ type: 'success', message: 'Admin demoted to user.' });
        fetchUsers();
      } else {
        setUserActionToast({ type: 'error', message: 'Failed to demote admin.' });
      }
    } catch (e) {
      setUserActionToast({ type: 'error', message: 'Failed to demote admin.' });
    }
    setUserLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    setUserLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'user-id': userId || '' },
      });
      if (res.ok) {
        setUserActionToast({ type: 'success', message: 'User deleted.' });
        fetchUsers();
      } else {
        setUserActionToast({ type: 'error', message: 'Failed to delete user.' });
      }
    } catch (e) {
      setUserActionToast({ type: 'error', message: 'Failed to delete user.' });
    }
    setUserLoading(false);
  };

  // Filtered and searched courses
  const filteredCourses = adminCourses.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCategory || c.category.toLowerCase().includes(filterCategory.toLowerCase()))
  );

  // Fetch users when Manage Users tab is active
  useEffect(() => {
    if (showAdmin && activeTab === 2) fetchUsers();
  }, [showAdmin, activeTab]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Toast auto-hide for user actions
  useEffect(() => {
    if (userActionToast) {
      const t = setTimeout(() => setUserActionToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [userActionToast]);

  // Responsive width
  const screenWidth = Dimensions.get('window').width;

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
          <View style={styles.adminSection}>
            {/* Tabs */}
            <View style={styles.tabBar}>
              {TABS.map((tab, idx) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, activeTab === idx && styles.activeTab]}
                  onPress={() => setActiveTab(idx)}
                >
                  <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Tab Content */}
            {activeTab === 0 ? (
              <View>
                {/* Search/Filter */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <TextInput
                    placeholder="Search by title"
                    value={search}
                    onChangeText={setSearch}
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholderTextColor="#aaa"
                  />
                  <TextInput
                    placeholder="Filter by category"
                    value={filterCategory}
                    onChangeText={setFilterCategory}
                    style={[styles.input, { flex: 1 }]}
                    placeholderTextColor="#aaa"
                  />
                </View>
                {loading ? (
                  <ActivityIndicator size="large" color="#FFA500" style={{ marginVertical: 20 }} />
                ) : (
                  <FlatList
                    data={filteredCourses}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <View style={styles.courseCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.courseTitle}>{item.title}</Text>
                          <Text style={styles.courseDesc}>{item.description}</Text>
                          <Text style={styles.coursePrice}>Price: {item.price}</Text>
                          <Text style={styles.courseCat}>Category: {item.category}</Text>
                          <Text style={styles.courseCat}>Playlist: <Text style={{ color: '#4A90E2' }}>{item.youtubePlaylistId}</Text></Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                          <TouchableOpacity onPress={() => handleEdit(item)} style={{ marginBottom: 8 }}>
                            <Ionicons name="create-outline" size={22} color="#4A90E2" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item._id)}>
                            <Ionicons name="trash-outline" size={22} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>No courses found.</Text>}
                    style={{ minHeight: 200, width: screenWidth - 60 }}
                  />
                )}
              </View>
            ) : activeTab === 1 ? (
              <View>
                <TextInput placeholder="Title*" value={newCourse.title} onChangeText={v => setNewCourse({ ...newCourse, title: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Description*" value={newCourse.description} onChangeText={v => setNewCourse({ ...newCourse, description: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Price*" value={newCourse.price} onChangeText={v => setNewCourse({ ...newCourse, price: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Rating (0-5)" value={newCourse.rating} onChangeText={v => setNewCourse({ ...newCourse, rating: v })} style={styles.input} placeholderTextColor="#aaa" keyboardType="numeric" />
                <TextInput placeholder="Instructor*" value={newCourse.instructor} onChangeText={v => setNewCourse({ ...newCourse, instructor: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Level*" value={newCourse.level} onChangeText={v => setNewCourse({ ...newCourse, level: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Icon (emoji)*" value={newCourse.icon} onChangeText={v => setNewCourse({ ...newCourse, icon: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="Category*" value={newCourse.category} onChangeText={v => setNewCourse({ ...newCourse, category: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TextInput placeholder="YouTube Playlist ID" value={newCourse.youtubePlaylistId} onChangeText={v => setNewCourse({ ...newCourse, youtubePlaylistId: v })} style={styles.input} placeholderTextColor="#aaa" />
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateOrUpdate}>
                  <Text style={styles.saveBtnText}>{editCourseId ? 'Update' : 'Create'} Course</Text>
                </TouchableOpacity>
                {editCourseId && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditCourseId(null); setNewCourse({ title: '', description: '', price: '', rating: '', instructor: '', level: '', icon: '', category: '', youtubePlaylistId: '' }); }}>
                    <Text style={styles.cancelBtnText}>Cancel Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View>
                {userLoading ? (
                  <ActivityIndicator size="large" color="#FFA500" style={{ marginVertical: 20 }} />
                ) : (
                  <FlatList
                    data={adminUsers}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                      <View style={styles.courseCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.courseTitle}>{item.name} {item.role === 'admin' && <Text style={{ color: '#FFA500' }}>(Admin)</Text>}</Text>
                          <Text style={styles.courseDesc}>{item.email}</Text>
                          <Text style={styles.courseCat}>Role: {item.role}</Text>
                          <Text style={styles.courseCat}>ID: {item._id}</Text>
                        </View>
                        <View style={{ justifyContent: 'center' }}>
                          {item.role !== 'admin' ? (
                            <TouchableOpacity onPress={() => handlePromote(item._id)} style={{ marginBottom: 8 }}>
                              <Ionicons name="arrow-up-circle-outline" size={22} color="#4A90E2" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity onPress={() => handleDemote(item._id)} style={{ marginBottom: 8 }}>
                              <Ionicons name="arrow-down-circle-outline" size={22} color="#FFA500" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => handleDeleteUser(item._id)}>
                            <Ionicons name="person-remove-outline" size={22} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    ListEmptyComponent={<Text style={{ color: '#aaa', textAlign: 'center', marginTop: 20 }}>No users found.</Text>}
                    style={{ minHeight: 200, width: screenWidth - 60 }}
                  />
                )}
                {userActionToast && (
                  <View style={[styles.toast, userActionToast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                    <Text style={{ color: '#fff' }}>{userActionToast.message}</Text>
                  </View>
                )}
              </View>
            )}
            {/* Delete Confirmation Modal */}
            <Modal
              visible={modalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalBg}>
                <View style={styles.modalBox}>
                  <Text style={{ color: '#fff', fontSize: 16, marginBottom: 16 }}>Are you sure you want to delete this course?</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={styles.modalBtn} onPress={confirmDelete}>
                      <Text style={{ color: '#fff' }}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#888' }]} onPress={() => setModalVisible(false)}>
                      <Text style={{ color: '#fff' }}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* Toast */}
            {toast && (
              <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                <Text style={{ color: '#fff' }}>{toast.message}</Text>
              </View>
            )}
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
  adminSection: {
    marginVertical: 30,
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFA500',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#222',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  courseTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  courseDesc: {
    color: '#aaa',
    fontSize: 13,
    marginVertical: 2,
  },
  coursePrice: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 13,
  },
  courseCat: {
    color: '#bbb',
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  saveBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#888',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  modalBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginHorizontal: 10,
  },
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 100,
  },
  toastSuccess: {
    backgroundColor: '#4CAF50',
  },
  toastError: {
    backgroundColor: '#ff4444',
  },
});

export default ProfileScreen;