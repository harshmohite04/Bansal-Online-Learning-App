const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if cannot connect to database
});

// User Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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

// Add UserCourse schema for tracking purchased courses and progress
const userCourseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now }
});

const UserCourse = mongoose.model('UserCourse', userCourseSchema);

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Helper to check admin
async function isAdmin(userId) {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
}

// Sign Up API
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Sign In API
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Debug log
        console.log('User logging in:', user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Error signing in' });
    }
});

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        const coursesWithId = courses.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            rating: course.rating,
            instructor: course.instructor,
            level: course.level,
            icon: course.icon,
            category: course.category,
            youtubePlaylistId: course.youtubePlaylistId
        }));
        res.json(coursesWithId);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// Get courses by category
app.get('/api/courses/category/:category', async (req, res) => {
    try {
        const courses = await Course.find({ category: req.params.category });
        const coursesWithId = courses.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            rating: course.rating,
            instructor: course.instructor,
            level: course.level,
            icon: course.icon,
            category: course.category,
            youtubePlaylistId: course.youtubePlaylistId
        }));
        res.json(coursesWithId);
    } catch (error) {
        console.error('Error fetching courses by category:', error);
        res.status(500).json({ message: 'Error fetching courses by category' });
    }
});

// Search courses
app.get('/api/courses/search', async (req, res) => {
    try {
        const { query } = req.query;
        const courses = await Course.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        const coursesWithId = courses.map(course => ({
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            rating: course.rating,
            instructor: course.instructor,
            level: course.level,
            icon: course.icon,
            category: course.category,
            youtubePlaylistId: course.youtubePlaylistId
        }));
        res.json(coursesWithId);
    } catch (error) {
        console.error('Error searching courses:', error);
        res.status(500).json({ message: 'Error searching courses' });
    }
});

// Get purchased courses for a user
app.get('/api/courses/purchased', async (req, res) => {
    try {
        // TODO: Get userId from authentication token
        const userId = req.headers['user-id']; // Temporary solution, replace with proper auth
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userCourses = await UserCourse.find({ userId })
            .populate('courseId')
            .sort({ lastAccessed: -1 });

        const courses = userCourses.map(uc => ({
            id: uc.courseId._id,
            title: uc.courseId.title,
            description: uc.courseId.description,
            instructor: uc.courseId.instructor,
            level: uc.courseId.level,
            icon: uc.courseId.icon,
            progress: uc.progress,
            youtubePlaylistId: uc.courseId.youtubePlaylistId
        }));

        res.json(courses);
    } catch (error) {
        console.error('Error fetching purchased courses:', error);
        res.status(500).json({ message: 'Error fetching purchased courses' });
    }
});

// Purchase a course
app.post('/api/courses/:courseId/purchase', async (req, res) => {
    try {
        // TODO: Get userId from authentication token
        const userId = req.headers['user-id']; // Temporary solution, replace with proper auth
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const courseId = req.params.courseId;
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already purchased
        const existingPurchase = await UserCourse.findOne({ userId, courseId });
        if (existingPurchase) {
            return res.status(400).json({ message: 'Course already purchased' });
        }

        // Create new purchase
        const userCourse = new UserCourse({
            userId,
            courseId,
            progress: 0
        });

        await userCourse.save();

        res.status(201).json({ message: 'Course purchased successfully' });
    } catch (error) {
        console.error('Error purchasing course:', error);
        res.status(500).json({ message: 'Error purchasing course' });
    }
});

// Update course progress
app.put('/api/courses/:courseId/progress', async (req, res) => {
    try {
        // TODO: Get userId from authentication token
        const userId = req.headers['user-id']; // Temporary solution, replace with proper auth
        
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const { progress } = req.body;
        const courseId = req.params.courseId;

        const userCourse = await UserCourse.findOne({ userId, courseId });
        if (!userCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        userCourse.progress = Math.min(100, Math.max(0, progress));
        userCourse.lastAccessed = new Date();
        await userCourse.save();

        res.json({ message: 'Progress updated successfully' });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
});

// Admin-only: Create course
app.post('/api/admin/courses', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const course = new Course(req.body);
        await course.save();
        const courseWithId = {
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            rating: course.rating,
            instructor: course.instructor,
            level: course.level,
            icon: course.icon,
            category: course.category,
            youtubePlaylistId: course.youtubePlaylistId
        };
        res.status(201).json(courseWithId);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
});

// Admin-only: Update course
app.put('/api/admin/courses/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const courseWithId = {
            id: course._id,
            title: course.title,
            description: course.description,
            price: course.price,
            rating: course.rating,
            instructor: course.instructor,
            level: course.level,
            icon: course.icon,
            category: course.category,
            youtubePlaylistId: course.youtubePlaylistId
        };
        res.json(courseWithId);
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Admin-only: Delete course
app.delete('/api/admin/courses/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

// Admin-only: List all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const users = await User.find({}, '-password'); // Exclude password
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Admin-only: Promote user to admin
app.post('/api/admin/users/:id/promote', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User promoted to admin', user });
    } catch (error) {
        console.error('Error promoting user:', error);
        res.status(500).json({ message: 'Error promoting user' });
    }
});

// Admin-only: Demote admin to user
app.post('/api/admin/users/:id/demote', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const user = await User.findByIdAndUpdate(req.params.id, { role: 'user' }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Admin demoted to user', user });
    } catch (error) {
        console.error('Error demoting admin:', error);
        res.status(500).json({ message: 'Error demoting admin' });
    }
});

// Admin-only: Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        const userId = req.headers['user-id'];
        if (!userId || !(await isAdmin(userId))) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
