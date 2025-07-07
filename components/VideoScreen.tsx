import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  icon: string;
  progress: number;
  youtubePlaylistId?: string;
  thumbnail?: string;
}

interface PlaylistVideo {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf';
  thumbnail?: string;
}

const mockPlaylistVideos: PlaylistVideo[] = [
  { id: 'vid1', title: '1. Course intro', duration: '4:45', type: 'video', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg' },
  { id: 'vid2', title: '2. Course', duration: '25:00', type: 'video', thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/0.jpg' },
  { id: 'vid3', title: '3. Course (Homework)', duration: 'PDF', type: 'pdf', thumbnail: 'https://via.placeholder.com/120x80.png?text=PDF' },
  { id: 'vid4', title: '4. Next Topic', duration: '12:30', type: 'video', thumbnail: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/0.jpg' },
];

const VideoScreen = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'content' | 'discussion'>('content');
  const [selectedVideo, setSelectedVideo] = useState<PlaylistVideo | null>(mockPlaylistVideos[0]);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);

  const fetchPurchasedCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      console.log(userId);
      if (!userId) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }
      const response = await fetch('https://bansal-online-learning-app.onrender.com/api/courses/purchased', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchased courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Error fetching purchased courses:', err);
      setError('Failed to load purchased courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const handleContinueLearning = (course: Course) => {
    setSelectedCourse(course);
    setVideoModalVisible(true);
  };

  const updateProgress = async (courseId: string, newProgress: number) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`https://bansal-online-learning-app.onrender.com/api/courses/${courseId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
        body: JSON.stringify({ progress: newProgress }),
      });

      if (response.ok) {
        // Update local state
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.id === courseId
              ? { ...course, progress: newProgress }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleSelectVideo = (video: PlaylistVideo) => {
    setSelectedVideo(video);
    if (!completedVideos.includes(video.id)) {
      setCompletedVideos(prev => [...prev, video.id]);
    }
  };

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => handleContinueLearning(course)}>
      <Image
        source={{ uri: course.thumbnail || 'https://via.placeholder.com/80x80.png?text=Course' }}
        style={styles.courseThumbnail}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription}>{course.description}</Text>
        {/* Render YouTube playlist if available */}
        {course.youtubePlaylistId && (
          <View style={{ height: 200, marginVertical: 10 }}>
            <WebView
              source={{ uri: `${course.youtubePlaylistId}` }}
              style={{ flex: 1 }}
              javaScriptEnabled
              domStorageEnabled
            />
          </View>
        )}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${course.progress}%` }]} />
          <Text style={styles.progressText}>{course.progress}% Complete</Text>
        </View>
        <View style={styles.courseFooter}>
          <Text style={styles.instructorText}>
            by {course.instructor} • {course.level}
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => handleContinueLearning(course)}
          >
            <Text style={styles.continueButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No courses purchased yet</Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Explore Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.coursesContainer}>
            {courses.map(renderCourseCard)}
          </View>
        )}
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={videoModalVisible}
        animationType="slide"
        onRequestClose={() => setVideoModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Video Player Section */}
          <View style={styles.playerSection}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setVideoModalVisible(false)}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.videoTitle}>{selectedVideo?.title || selectedCourse?.title}</Text>
            <View style={styles.playerBox}>
              {selectedVideo?.type === 'video' && selectedCourse?.youtubePlaylistId ? (
                <WebView
                  source={{ uri: `${selectedCourse.youtubePlaylistId}` }}
                  style={styles.videoPlayer}
                  javaScriptEnabled
                  domStorageEnabled
                  allowsFullscreenVideo
                  mediaPlaybackRequiresUserAction={false}
                />
              ) : (
                <View style={styles.noVideoContainer}>
                  <Ionicons name="document-outline" size={64} color="#666" />
                  <Text style={styles.noVideoText}>PDF or no video</Text>
                </View>
              )}
            </View>
          </View>
          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'content' && styles.activeTabItem]}
              onPress={() => setSelectedTab('content')}
            >
              <Text style={[styles.tabText, selectedTab === 'content' && styles.activeTabText]}>Course Content</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabItem, selectedTab === 'discussion' && styles.activeTabItem]}
              onPress={() => setSelectedTab('discussion')}
            >
              <Text style={[styles.tabText, selectedTab === 'discussion' && styles.activeTabText]}>Discussion</Text>
            </TouchableOpacity>
          </View>
          {/* Tab Content */}
          {selectedTab === 'content' ? (
            <ScrollView style={styles.sectionList} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {mockPlaylistVideos.map(video => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.videoThumbnailContainer}
                  onPress={() => handleSelectVideo(video)}
                >
                  <Image
                    source={{ uri: video.thumbnail || 'https://via.placeholder.com/120x80.png?text=Video' }}
                    style={styles.videoThumbnail}
                  />
                  <Text style={styles.videoRowTitle}>{video.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.discussionTab}><Text style={{ color: '#aaa' }}>Discussion coming soon...</Text></View>
          )}
        </SafeAreaView>
      </Modal>
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
  coursesContainer: {
    gap: 15,
    paddingVertical: 10,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  courseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#333',
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
  progressContainer: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  progressText: {
    fontSize: 12,
    color: '#4A90E2',
    marginBottom: 8,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructorText: {
    fontSize: 12,
    color: '#999',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  playerSection: {
    flex: 1,
    padding: 10,
  },
  closeButton: {
    padding: 5,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  playerBox: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  videoPlayer: {
    flex: 1,
    borderRadius: 10,
  },
  noVideoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVideoText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  tabItem: {
    padding: 10,
  },
  activeTabItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    color: '#fff',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  sectionList: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    padding: 10,
  },
  videoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  videoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoRowTitle: {
    fontSize: 16,
    color: '#fff',
  },
  videoRowMeta: {
    fontSize: 12,
    color: '#999',
  },
  discussionTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoThumbnailContainer: {
    width: 130,
    margin: 8,
    alignItems: 'center',
  },
  videoThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#222',
    marginBottom: 6,
  },
});

export default VideoScreen; 