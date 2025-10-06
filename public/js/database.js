// MongoDB Connection and Database Operations
class Database {
    constructor() {
        this.client = null;
        this.db = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Replace with your MongoDB connection string
            const MONGODB_URI = 'mongodb://localhost:27017/bioinformatics_db';

            this.client = new MongoClient(MONGODB_URI);
            await this.client.connect();
            this.db = this.client.db('bioinformatics_db');
            this.isConnected = true;
            console.log('Connected to MongoDB');
            return true;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            this.isConnected = false;
            return false;
        }
    }

    async getAccounts() {
        if (!this.isConnected) return [];
        try {
            const collection = this.db.collection('accounts');
            return await collection.find({}).toArray();
        } catch (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }
    }

    async addAccount(accountData) {
        if (!this.isConnected) return null;
        try {
            const collection = this.db.collection('accounts');
            const result = await collection.insertOne({
                ...accountData,
                createdAt: new Date()
            });
            return result.insertedId;
        } catch (error) {
            console.error('Error adding account:', error);
            return null;
        }
    }

    async deleteAccount(accountId) {
        if (!this.isConnected) return false;
        try {
            const collection = this.db.collection('accounts');
            const result = await collection.deleteOne({ _id: new ObjectId(accountId) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting account:', error);
            return false;
        }
    }

    async getReports() {
        if (!this.isConnected) return [];
        try {
            const collection = this.db.collection('reports');
            return await collection.find({})
                .sort({ createdAt: -1 })
                .limit(50)
                .toArray();
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    }

    async addReport(reportData) {
        if (!this.isConnected) return null;
        try {
            const collection = this.db.collection('reports');
            const result = await collection.insertOne({
                ...reportData,
                createdAt: new Date()
            });
            return result.insertedId;
        } catch (error) {
            console.error('Error adding report:', error);
            return null;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
        }
    }
}

// Global database instance
const db = new Database();

// Initialize connection when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await db.connect();
    // Load initial data
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
});
