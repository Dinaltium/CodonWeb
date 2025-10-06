const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 5000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'bioinformatics_db';

let db;
let usersCollection;
let accountsCollection;
let reportsCollection;

MongoClient.connect(MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
    usersCollection = db.collection('users');
    accountsCollection = db.collection('accounts');
    reportsCollection = db.collection('reports');
    
    createDefaultUser();
  })
  .catch(error => console.error('MongoDB connection error:', error));

async function createDefaultUser() {
  const existingUser = await usersCollection.findOne({ username: 'admin' });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await usersCollection.insertOne({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date()
    });
    console.log('Default admin user created (username: admin, password: admin123)');
  }
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'bioinformatics-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.use(express.static('public'));

function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await usersCollection.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        email: user.email,
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const user = await usersCollection.findOne(
      { _id: new ObjectId(req.session.userId) },
      { projection: { password: 0 } }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/accounts', requireAuth, async (req, res) => {
  try {
    const accounts = await accountsCollection.find({}).toArray();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/accounts', requireAuth, async (req, res) => {
  try {
    const { name, email, type, description } = req.body;
    const result = await accountsCollection.insertOne({
      name,
      email,
      type,
      description,
      createdBy: req.session.username,
      createdAt: new Date()
    });
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/accounts/:id', requireAuth, async (req, res) => {
  try {
    await accountsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reports', requireAuth, async (req, res) => {
  try {
    const reports = await reportsCollection.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/reports', requireAuth, async (req, res) => {
  try {
    const { sequenceLength, totalCodons, gcContent, atContent, sequence } = req.body;
    const result = await reportsCollection.insertOne({
      sequenceLength,
      totalCodons,
      gcContent,
      atContent,
      sequence: sequence.substring(0, 100),
      createdBy: req.session.username,
      createdAt: new Date()
    });
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
