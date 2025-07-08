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
  View,
} from 'react-native';
import { Video } from 'expo-av';

// ------------- Types -------------
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  icon: string;
  progress: number;
  thumbnail?: string;
}

interface PlaylistVideo {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'pdf';
  thumbnail?: string;
  videoUrl?: string;
}

// ------------- Dummy data -------------
const mockPlaylistVideos: PlaylistVideo[] = [
  {
    id: 'vid1',
    title: '1. Course intro',
    duration: '4:45',
    type: 'video',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
  },
  {
    id: 'vid2',
    title: '2. Main Lecture',
    duration: '25:00',
    type: 'video',
    videoUrl: 'https://www.w3schools.com/html/movie.mp4',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
  },
  {
    id: 'vid3',
    title: '3. Homework',
    duration: 'PDF',
    type: 'pdf',
    thumbnail: 'https://via.placeholder.com/120x80?text=PDF',
  },
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
  const [playlistVideos] = useState<PlaylistVideo[]>(mockPlaylistVideos);

  const fetchPurchasedCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setError('User not logged in.');
        return;
      }
      const resp = await fetch('https://bansal-online-learning-app.onrender.com/api/courses/purchased', {
        headers: { 'user-id': userId },
      });
      if (!resp.ok) throw new Error('Failed');
      const data = await resp.json();
      setCourses(data);
    } catch (e) {
      setError('Failed to load purchased courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, []);

  const openCourse = (course: Course) => {
    setSelectedCourse(course);
    setVideoModalVisible(true);
  };

  const selectVideo = (video: PlaylistVideo) => {
    setSelectedVideo(video);
    if (!completedVideos.includes(video.id)) setCompletedVideos((prev) => [...prev, video.id]);
  };

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity key={course.id} style={styles.courseCard} onPress={() => openCourse(course)}>
      <Image source={{ uri: course.thumbnail || 'https://via.placeholder.com/80' }} style={styles.courseThumb} />
      <View style={{ flex: 1 }}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDesc}>{course.description}</Text>
        <View style={styles.progressWrap}>
          <View style={[styles.progressBar, { width: `${course.progress}%` }]} />
        </View>
        <Text style={styles.progressTxt}>{course.progress}% complete</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTxt}>My Courses</Text>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : error ? (
          <Text style={styles.err}>{error}</Text>
        ) : courses.length === 0 ? (
          <Text style={styles.empty}>No courses purchased yet</Text>
        ) : (
          courses.map(renderCourseCard)
        )}
      </ScrollView>

      <Modal visible={videoModalVisible} animationType="slide" onRequestClose={() => setVideoModalVisible(false)}>
        <SafeAreaView style={styles.modalWrap}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setVideoModalVisible(false)}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.videoHeader}>{selectedVideo?.title}</Text>
          <View style={styles.playerBox}>
            {selectedVideo?.type === 'video' && selectedVideo.videoUrl ? (
              <Video
                source={{ uri: selectedVideo.videoUrl }}
                resizeMode="contain"
                useNativeControls
                style={styles.videoPlayer}
              />
            ) : (
              <View style={styles.noVidWrap}>
                <Ionicons name="document-outline" size={64} color="#666" />
                <Text style={{ color: '#666' }}>PDF or no video</Text>
              </View>
            )}
          </View>

          <View style={styles.tabBar}>
            {['content', 'discussion'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, selectedTab === tab && styles.tabActive]}
                onPress={() => setSelectedTab(tab as any)}
              >
                <Text style={[styles.tabTxt, selectedTab === tab && styles.tabTxtActive]}>
                  {tab === 'content' ? 'Course Content' : 'Discussion'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedTab === 'content' ? (
            <ScrollView style={styles.sectionList}>
              {playlistVideos.map((v) => {
                const sel = selectedVideo?.id === v.id;
                const done = completedVideos.includes(v.id);
                return (
                  <TouchableOpacity key={v.id} style={[styles.videoRow, sel && styles.videoRowSel]} onPress={() => selectVideo(v)}>
                    <Image source={{ uri: v.thumbnail || 'https://via.placeholder.com/120' }} style={styles.rowThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{v.title}</Text>
                      <Text style={styles.rowMeta}>{v.duration}</Text>
                    </View>
                    <Ionicons name={done ? 'checkmark-circle' : 'checkmark-circle-outline'} size={24} color={done ? '#4A90E2' : '#888'} />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.discussionWrap}>
              <Text style={{ color: '#aaa' }}>Discussion coming soon…</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: 
  { flex: 1, 
    backgroundColor: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  headerTxt: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollBody: { padding: 16 },
  courseCard: { flexDirection: 'row', backgroundColor: '#2a2a2a', borderRadius: 12, marginBottom: 16, padding: 12 },
  courseThumb: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  courseTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  courseDesc: { color: '#999', fontSize: 13, marginTop: 2 },
  progressWrap: { height: 4, backgroundColor: '#333', borderRadius: 2, marginTop: 8 },
  progressBar: { height: '100%', backgroundColor: '#4A90E2', borderRadius: 2 },
  progressTxt: { fontSize: 12, color: '#4A90E2', marginTop: 6 },
  err: { color: '#ff4444', textAlign: 'center' },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
  modalWrap: { flex: 1, backgroundColor: '#1a1a1a' },
  backBtn: { padding: 8 },
  videoHeader: { color: '#fff', fontSize: 18, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  playerBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  videoPlayer: { width: '100%', height: '100%' },
  noVidWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12, borderBottomColor: '#333', borderBottomWidth: 1 },
  tabItem: { paddingVertical: 10 },
  tabActive: { borderBottomColor: '#4A90E2', borderBottomWidth: 2 },
  tabTxt: { color: '#fff', fontSize: 14 },
  tabTxtActive: { fontWeight: 'bold' },
  sectionList: { flex: 1 },
  videoRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomColor: '#222', borderBottomWidth: 1 },
  videoRowSel: { backgroundColor: '#233045' },
  rowThumb: { width: 100, height: 70, borderRadius: 8, marginRight: 10 },
  rowTitle: { color: '#fff', fontSize: 15 },
  rowMeta: { color: '#999', fontSize: 12 },
  discussionWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default VideoScreen;
