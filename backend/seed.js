const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    rating: { type: Number, required: true },
    instructor: { type: String, required: true },
    level: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
    youtubePlaylistId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

const sampleCourses = [
    {
        title: 'Vue.js Masterclass',
        description: 'Master Vue.js from scratch. Build modern web applications with Vue 3.',
        price: '$50',
        rating: 4.8,
        instructor: 'Sarah Wilson',
        level: 'Beginner',
        icon: '🔷',
        category: 'Web',
        youtubePlaylistId: 'PL4cUxeGkcC9hYYGbVfkFkdJQAph_UtUEq'
    },
    {
        title: 'React.js Fundamentals',
        description: 'Learn React.js core concepts and build real-world applications.',
        price: '$60',
        rating: 4.9,
        instructor: 'John Smith',
        level: 'Intermediate',
        icon: '⚛️',
        category: 'Web',
        youtubePlaylistId: 'PL4cUxeGkcC9gZD-Tvwfod2gaISzfRiP9d'
    },
    {
        title: 'Python for Data Science',
        description: 'Master Python programming for data analysis and machine learning.',
        price: '$75',
        rating: 4.7,
        instructor: 'Emily Chen',
        level: 'Beginner',
        icon: '🐍',
        category: 'Python',
        youtubePlaylistId: 'PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU'
    },
    {
        title: 'Java Programming',
        description: 'Comprehensive Java programming course for beginners to advanced.',
        price: '$65',
        rating: 4.6,
        instructor: 'Michael Brown',
        level: 'Intermediate',
        icon: '☕',
        category: 'Java',
        youtubePlaylistId: 'PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ'
    },
    {
        title: 'Game Development with Unity',
        description: 'Create amazing games using Unity game engine.',
        price: '$80',
        rating: 4.9,
        instructor: 'David Lee',
        level: 'Beginner',
        icon: '🎮',
        category: 'Game development',
        youtubePlaylistId: 'PLPV2KyIb3jR5QFsefuO2YTlN0oB45EzGg'
    },
    {
        title: 'DevOps Fundamentals',
        description: 'Learn essential DevOps practices and tools.',
        price: '$70',
        rating: 4.7,
        instructor: 'Lisa Wang',
        level: 'Intermediate',
        icon: '🔄',
        category: 'DevOps',
        youtubePlaylistId: 'PL9gnSGHSqcnoqBXdJWUTg_fd8xEI7C-0n'
    },
    {
        title: 'Financial Analysis',
        description: 'Master financial analysis and investment strategies.',
        price: '$90',
        rating: 4.8,
        instructor: 'Robert Johnson',
        level: 'Advanced',
        icon: '💰',
        category: 'Finance',
        youtubePlaylistId: 'PL9gnSGHSqcnLw1JqjCkvHHmW1Bxcb7p2J'
    }
];

async function seedDatabase() {
    try {
        // Clear existing courses
        await Course.deleteMany({});
        console.log('Cleared existing courses');

        // Insert sample courses
        await Course.insertMany(sampleCourses);
        console.log('Successfully seeded database with sample courses');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
} 