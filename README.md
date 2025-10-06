# Bioinformatics Platform - Simplified Version

A web-based bioinformatics platform for DNA sequence analysis using **HTML, CSS, JavaScript, and MongoDB**.

## 🧬 Features

- **DNA Sequence Analysis** - Input validation and processing
- **Codon Translation** - 64-codon standard genetic code table
- **Amino Acid Conversion** - DNA to protein sequence translation
- **GC/AT Content Calculation** - Sequence composition analysis
- **Codon Frequency Analysis** - Statistical analysis with visual charts
- **Report Management** - Save and view analysis history
- **Account Management** - Create and manage user accounts
- **Responsive Dashboard** - Modern, collapsible sidebar interface

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: MongoDB
- **No Backend**: Direct client-to-database connection

## 📁 Project Structure

```
CodonCraft/
├── index.html              # Main application page
├── public/                 # Static assets
│   ├── css/
│   │   ├── dashboard.css   # Main styles
│   │   └── login.css       # Login styles
│   └── js/
│       ├── database.js     # MongoDB connection & operations
│       ├── dashboard.js    # Main dashboard logic
│       ├── sequence.js     # DNA analysis functionality
│       ├── reports.js      # Report management
│       └── settings.js     # Settings & account management
└── data/                   # Local data storage (if MongoDB unavailable)
    ├── accounts.json
    ├── reports.json
    └── users.json
```

## 🚀 Getting Started

### Prerequisites

1. **MongoDB** - Install MongoDB locally or use MongoDB Atlas
2. **Web Server** - Any local web server (Live Server, Python HTTP server, etc.)

### Setup

1. **Clone/Download** the project files
2. **Start MongoDB** locally or configure MongoDB Atlas connection
3. **Update Database Connection** in `public/js/database.js`:
   ```javascript
   const MONGODB_URI = 'mongodb://localhost:27017/bioinformatics_db';
   // OR for MongoDB Atlas:
   // const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/bioinformatics_db';
   ```
4. **Start a web server** in the project directory:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   ```
5. **Open** `http://localhost:8000` in your browser

## 🎯 Usage

1. **Open the application** in your web browser
2. **Navigate** using the collapsible sidebar
3. **Sequence Analysis**: Enter DNA sequences and analyze them
4. **View Reports**: Check your analysis history
5. **Manage Accounts**: Add/remove user accounts
6. **Dashboard**: View statistics and quick actions

## ⚠️ Important Notes

### Security Considerations
- **Database credentials** are exposed in client-side code
- **No authentication** system (anyone can access/modify data)
- **No server-side validation** of data
- **Suitable for projects/learning only** - not for production use

### MongoDB Setup
- **Local MongoDB**: Install MongoDB locally and ensure it's running
- **MongoDB Atlas**: Create a free cluster and update the connection string
- **Database**: The app will create collections automatically (`accounts`, `reports`)

### Browser Compatibility
- **Modern browsers** required (Chrome, Firefox, Safari, Edge)
- **MongoDB JavaScript driver** loaded from CDN
- **CORS** may need to be configured for external MongoDB connections

## 🔧 Configuration

### Database Connection
Edit `public/js/database.js` to change MongoDB connection:
```javascript
const MONGODB_URI = 'your-mongodb-connection-string';
```

### Styling
All styles are in `public/css/dashboard.css` - customize colors, fonts, and layout as needed.

## 📊 Data Structure

### Accounts Collection
```javascript
{
  _id: ObjectId,
  name: string,
  email: string,
  type: string,
  description: string,
  createdAt: Date
}
```

### Reports Collection
```javascript
{
  _id: ObjectId,
  sequenceLength: number,
  totalCodons: number,
  gcContent: number,
  atContent: number,
  sequence: string,
  createdBy: string,
  createdAt: Date
}
```

## 🎨 Customization

- **Colors**: Modify CSS variables in `dashboard.css`
- **Layout**: Adjust grid and flexbox properties
- **Features**: Add new analysis tools in `sequence.js`
- **Database**: Extend `database.js` for additional collections

## 📝 License

This project is for educational and project purposes only.
