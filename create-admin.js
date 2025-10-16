const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/codoncraft';

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'User', enum: ['User', 'Researcher', 'Administrator'] },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('⚠️    Admin user already exists. Resetting password...........');
            // Reset password
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.updateOne({ username: 'admin' }, { password: hashedPassword });
            console.log('✅ Admin password reset successfully!');
        } else {
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = new User({
                username: 'admin',
                email: 'admin@codoncraft.com',
                password: hashedPassword,
                role: 'Administrator'
            });
            await adminUser.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin();
