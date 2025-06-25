import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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

interface Course {
  id: string;
  title: string;
  description: string;
  price: string;
  rating: number;
  instructor: string;
  level: string;
  icon: string;
  category: string;
}

const ExploreScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [buying, setBuying] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = [
    'Game development',
    'Finance',
    'Python',
    'Programming',
    'Java',
    'Web',
    'DevOps',
  ];

  const fetchCourses = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = category 
        ? `https://bansal-online-learning-app.onrender.com/api/courses/category/${encodeURIComponent(category)}`
        : 'https://bansal-online-learning-app.onrender.com/api/courses';
      // console.log('Fetching courses from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      // console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // console.log('Received courses:', data);
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://bansal-online-learning-app.onrender.com/api/courses/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search courses');
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError('Failed to search courses. Please try again.');
      console.error('Error searching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCategories.length > 0) {
      fetchCourses(selectedCategories[0]);
    } else {
      fetchCourses();
    }
  }, [selectedCategories]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchText) {
        searchCourses(searchText);
      } else {
        fetchCourses();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [category] // Only allow one category to be selected at a time
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name="star"
        size={12}
        color={index < rating ? "#FFD700" : "#666"}
      />
    ));
  };

  const handleBuy = async () => {
    if (!selectedCourse) return;
    console.log('Selected course for purchase:', selectedCourse);
    console.log('Course ID:', selectedCourse.id);
    setBuying(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setToast({ type: 'error', message: 'User not logged in.' });
        setBuying(false);
        return;
      }
      const res = await fetch(`https://bansal-online-learning-app.onrender.com/api/courses/${selectedCourse.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
      });
      console.log('Purchase response status:', res.status);
      if (res.ok) {
        setToast({ type: 'success', message: 'Course purchased!' });
        setModalVisible(false);
      } else {
        const data = await res.json();
        setToast({ type: 'error', message: data.message || 'Failed to purchase.' });
      }
    } catch (e) {
      console.error('Purchase error:', e);
      setToast({ type: 'error', message: 'Failed to purchase.' });
    }
    setBuying(false);
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => { setSelectedCourse(course); setModalVisible(true); }}>
      <View style={styles.courseIcon}>
        <Text style={styles.courseIconText}>{course.icon}</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
        <Text style={styles.coursePrice}>{course.price}</Text>
        <View style={styles.courseFooter}>
          <View style={styles.ratingContainer}>
            {renderStars(course.rating)}
            <Text style={styles.ratingText}>{course.rating}</Text>
          </View>
          <Text style={styles.instructorText}>
            by {course.instructor} • {course.level}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="cart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a course..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Browse Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryTag,
                  selectedCategories.includes(category) && styles.selectedCategoryTag
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategories.includes(category) && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Courses</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A90E2" />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <View style={styles.coursesContainer}>
              {courses.map(renderCourseCard)}
            </View>
          )}
        </View>
      </ScrollView>
      {/* Modal for course details and buy */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#222', borderRadius: 16, padding: 24, width: '85%' }}>
            {selectedCourse && (
              <>
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>{selectedCourse.title}</Text>
                <Text style={{ color: '#aaa', marginBottom: 8 }}>{selectedCourse.description}</Text>
                <Text style={{ color: '#4A90E2', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>{selectedCourse.price}</Text>
                <Text style={{ color: '#fff', marginBottom: 8 }}>Instructor: {selectedCourse.instructor}</Text>
                <Text style={{ color: '#fff', marginBottom: 8 }}>Level: {selectedCourse.level}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, marginTop: 10, alignItems: 'center' }}
                  onPress={handleBuy}
                  disabled={buying}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{buying ? 'Processing...' : 'Buy Course'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 10, alignItems: 'center' }} onPress={() => setModalVisible(false)}>
                  <Text style={{ color: '#aaa' }}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* Toast */}
      {toast && (
        <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, backgroundColor: toast.type === 'success' ? '#4CAF50' : '#ff4444', padding: 14, borderRadius: 8, alignItems: 'center', zIndex: 100 }}>
          <Text style={{ color: '#fff' }}>{toast.message}</Text>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 25,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  searchButton: {
    padding: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryTag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  selectedCategoryTag: {
    backgroundColor: '#4A90E2',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: '600',
  },
  coursesContainer: {
    gap: 15,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  courseIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courseIconText: {
    fontSize: 24,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 12,
    marginLeft: 5,
    fontWeight: '600',
  },
  instructorText: {
    fontSize: 12,
    color: '#999',
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    textAlign: 'center',
    padding: 20,
  },
});

export default ExploreScreen;