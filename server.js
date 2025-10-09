const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/codoncraft';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
        console.log(`Database: ${MONGODB_URI}`);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        console.log('Make sure MongoDB is running on port 27018');
    });

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User', enum: ['User', 'Researcher', 'Administrator'] },
    createdAt: { type: Date, default: Date.now }
});

// Report Schema
const reportSchema = new mongoose.Schema({
    sequence: { type: String, required: true },
    sequenceLength: { type: Number, required: true },
    totalCodons: { type: Number, required: true },
    gcContent: { type: Number, required: true },
    atContent: { type: Number, required: true },
    codonCounts: { type: Object, default: {} },
    aminoAcidCounts: { type: Object, default: {} },
    createdBy: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Report = mongoose.model('Report', reportSchema);

// API Routes

// Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (username.length < 4) {
            return res.status(400).json({ error: 'Username must be at least 4 characters long' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters long' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({
                error: existingUser.username === username ?
                    'Username already exists' : 'Email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'User'
        });

        await user.save();

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        if (username.length < 4) {
            return res.status(400).json({ error: 'Username must be at least 4 characters long' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Password must be at least 4 characters long' });
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password using bcrypt
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        res.json({ success: !!result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reports
app.get('/api/reports', async (req, res) => {
    try {
        const reports = await Report.find({})
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const report = new Report(req.body);
        await report.save();
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/reports/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/reports/:id', async (req, res) => {
    try {
        const result = await Report.findByIdAndDelete(req.params.id);
        res.json({ success: !!result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});
