import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function DashboardScreen() {
  const courses = [
    {
      id: '1',
      title: 'Math 102',
      description: 'All can be perfect in math...',
      price: '$50',
      color: '#FFA500',
    },
    {
      id: '2',
      title: 'Computer Science 2',
      description: 'All can be perfect in any...',
      price: '$80',
      color: '#00D9F5',
    },
    {
      id: '3',
      title: 'Python 3',
      description: 'All can be perfect in prog...',
      price: 'Free',
      color: '#38D88F',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/fire.png')}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <View style={styles.nameRow}>
            <Text style={styles.username}>Mahmoud.S</Text>
            <Feather name="check-circle" size={16} color="#00CFFF" />
          </View>
        </View>
        <Feather name="bell" size={24} color="#fff" style={styles.bell} />
      </View>

      {/* Course Progress */}
      <View style={styles.progressBox}>
        <Text style={styles.sectionTitle}>Your progress in Courses</Text>
        <CourseProgress
          title="Computer Science"
          teacher="Sarah Adam"
          level="All Level"
          color="#4CAF50"
          rating={4.5}
          progress={0.7}
        />
        <CourseProgress
          title="Math 101"
          teacher="Ahmed Medo"
          level="Beginner"
          color="#FFC107"
          rating={5}
          progress={0.5}
        />
        <CourseProgress
          title="Algorithm"
          teacher="Seif El-Deen"
          level="Intermediate"
          color="#F44336"
          rating={4}
          progress={0.3}
        />
      </View>

      {/* Recommendations */}
      <Text style={styles.recommendLabel}>— Recommendation —</Text>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} />}
      />
    </ScrollView>
  );
}

function CourseProgress({ title, teacher, level, color, rating, progress }) {
  return (
    <View style={styles.progressItem}>
      <Text style={styles.courseTitle}>{title}</Text>
      <Text style={styles.courseInfo}>
        ⭐ {rating} • By {teacher} • {level}
      </Text>
      <ProgressBar progress={progress} color={color} style={styles.progressBar} />
    </View>
  );
}

function CourseCard({ course }) {
  return (
    <View style={[styles.card, { backgroundColor: '#1e1e1e' }]}>
      <View style={[styles.cardIcon, { backgroundColor: course.color }]}>
        <Ionicons name="school-outline" size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{course.title}</Text>
        <Text style={styles.cardDesc}>{course.description}</Text>
        <Text style={styles.cardPrice}>Price: {course.price}</Text>
        <Text style={styles.cardBy}>👩‍🏫 By Sarah William • All Level</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
    padding: 20,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
  welcome: {
    color: '#aaa',
    fontSize: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bell: {
    marginLeft: 'auto',
  },
  progressBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 12,
  },
  progressItem: {
    marginBottom: 15,
  },
  courseTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  courseInfo: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 5,
    backgroundColor: '#333',
  },
  recommendLabel: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardDesc: {
    color: '#ccc',
    fontSize: 12,
    marginVertical: 4,
  },
  cardPrice: {
    color: '#FFA500',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardBy: {
    color: '#bbb',
    fontSize: 11,
  },
});
