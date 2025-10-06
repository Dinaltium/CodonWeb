const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'bioinformatics_db';
const USE_FILE_STORAGE = !process.env.MONGODB_URI;

let db;
let usersCollection;
let accountsCollection;
let reportsCollection;

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

class FileStorage {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureFile();
  }

  ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  readData() {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  writeData(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async findAll(query = {}) {
    const data = this.readData();
    if (Object.keys(query).length === 0) {
      return data;
    }
    return data.filter(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' && typeof query[key] === 'object') {
          return item._id === query[key].toString();
        }
        return item[key] === query[key];
      });
    });
  }

  async findOne(query) {
    const results = await this.findAll(query);
    return results[0] || null;
  }
  
  find(query = {}) {
    const data = this.readData();
    let filtered = data;
    
    if (Object.keys(query).length > 0) {
      filtered = data.filter(item => {
        return Object.keys(query).every(key => {
          if (key === '_id' && typeof query[key] === 'object') {
            return item._id === query[key].toString();
          }
          return item[key] === query[key];
        });
      });
    }
    
    return new FileQuery(filtered);
  }

  async insertOne(doc) {
    const data = this.readData();
    const newDoc = {
      ...doc,
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    data.push(newDoc);
    this.writeData(data);
    return { insertedId: newDoc._id };
  }

  async deleteOne(query) {
    const data = this.readData();
    const filtered = data.filter(item => {
      if (query._id) {
        return item._id !== query._id.toString();
      }
      return true;
    });
    this.writeData(filtered);
    return { deletedCount: data.length - filtered.length };
  }

  async toArray() {
    return this.readData();
  }
}

class FileQuery {
  constructor(data) {
    this.data = data;
  }

  sort(sortObj) {
    const key = Object.keys(sortObj)[0];
    const order = sortObj[key];
    this.data.sort((a, b) => {
      if (order === 1) return a[key] > b[key] ? 1 : -1;
      return a[key] < b[key] ? 1 : -1;
    });
    return this;
  }

  limit(num) {
    this.data = this.data.slice(0, num);
    return this;
  }

  async toArray() {
    return this.data;
  }
}

async function initializeStorage() {
  if (USE_FILE_STORAGE) {
    console.log('Using file-based storage (MongoDB not configured)');
    usersCollection = new FileStorage(USERS_FILE);
    accountsCollection = new FileStorage(ACCOUNTS_FILE);
    reportsCollection = new FileStorage(REPORTS_FILE);
    await createDefaultUser();
  } else {
    try {
      const client = await MongoClient.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      db = client.db(DB_NAME);
      usersCollection = db.collection('users');
      accountsCollection = db.collection('accounts');
      reportsCollection = db.collection('reports');
      await createDefaultUser();
    } catch (error) {
      console.error('MongoDB connection error, falling back to file storage:', error.message);
      usersCollection = new FileStorage(USERS_FILE);
      accountsCollection = new FileStorage(ACCOUNTS_FILE);
      reportsCollection = new FileStorage(REPORTS_FILE);
      await createDefaultUser();
    }
  }
}

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
    const user = await usersCollection.findOne({ 
      _id: USE_FILE_STORAGE ? req.session.userId : new ObjectId(req.session.userId) 
    });
    
    if (user) {
      delete user.password;
    }
    
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
    await accountsCollection.deleteOne({ 
      _id: USE_FILE_STORAGE ? req.params.id : new ObjectId(req.params.id) 
    });
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

initializeStorage().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize storage:', error);
  process.exit(1);
});
