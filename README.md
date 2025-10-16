# 🧬 CodonCraft - Bioinformatics Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

A comprehensive web-based platform for codon analysis, DNA sequence processing, and bioinformatics research.



## ✨ Features

- **🔬 Sequence Analysis**: Analyze DNA sequences for codon usage patterns
- **📊 Interactive Dashboard**: Real-time statistics and visualizations
- **🧮 Codon Tools**: Reverse complement, GC calculator, ORF finder
- **📈 Advanced Analytics**: Codon bias analysis, amino acid composition
- **⚡ Optimization Insights**: Efficiency scoring and recommendations
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Option 1: Demo Mode (No Installation Required)
1. Open `public/dashboard.html` in your web browser
2. Start analyzing DNA sequences immediately!
3. Data is stored in browser localStorage

### Option 2: Full Mode (With MongoDB)
1. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Choose LTS version (recommended)

2. **Install MongoDB** (see [MongoDB Setup Guide](MONGODB_SETUP.md)):
   - Download from https://www.mongodb.com/try/download/community
   - Install and start MongoDB service (port 27018)

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Create Admin User** (Optional):
   ```bash
   npm run create-admin
   ```
   This creates/resets the default admin user:
   - Username: `admin`
   - Password: `admin123`
   - Email: `admin@codoncraft.com`
   
   **Emergency Access**: If you can't login, run this command to reset the admin password.

5. **Start the Server**:
   ```bash
   npm start
   ```

6. **Open Application**:
   - Navigate to http://localhost:3000
   - Check health: http://localhost:3000/api/health

## 📋 Prerequisites

### For Demo Mode:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required

### For Full Mode:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

### For Demo Mode (HTML/CSS/JS Only):
1. **Download/Clone** the repository
2. **Open** `public/dashboard.html` in your browser
3. **That's it!** No installation required

### For Full Mode (With MongoDB):
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/codoncraft.git
   cd codoncraft
   ```

2. **Install Node.js** (if not already installed):
   - Download from https://nodejs.org/
   - Choose LTS version

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Set Up MongoDB**:
   - See detailed instructions in [MONGODB_SETUP.md](MONGODB_SETUP.md)
   - Or use MongoDB Atlas (cloud version)

5. **Start the Application**:
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
CodonCraft/
├── public/                 # Frontend files
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   └── *.html             # HTML pages
├── server.js              # Node.js server
├── package.json           # Dependencies
├── MONGODB_SETUP.md       # MongoDB setup guide
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/codoncraft
PORT=3000
NODE_ENV=development
```

### Database Options
- **localStorage**: Demo mode, no server required
- **MongoDB**: Full production mode with persistent storage

## 📊 API Endpoints

When running in full mode, the following API endpoints are available:

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get specific report

## 🧬 Usage Examples

### Analyzing a DNA Sequence
1. Navigate to "Sequence Analysis" page
2. Paste your DNA sequence (ATCG only)
3. Click "Analyze Sequence"
4. View detailed codon usage statistics

### Using Codon Tools
1. Click "Codon Tools" on the dashboard
2. Select a tool:
   - **Reverse Complement**: Get reverse complement of DNA
   - **GC Calculator**: Calculate GC content
   - **Codon Optimizer**: Optimize codons for expression
   - **ORF Finder**: Find open reading frames

### Viewing Analytics
- **Dashboard**: Overview of all analyses
- **Reports**: Detailed analysis history
- **Settings**: Configure application preferences

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running on port 27017
- Check connection string in server.js
- Verify MongoDB service is started

**Port Already in Use**
- Change PORT in .env file
- Kill process using the port: `lsof -ti:3000 | xargs kill -9`

**CORS Errors**
- Ensure server is running on correct port
- Check API base URL in database.js

### Debug Mode
Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

### GitHub Contributors
Thank you to all our contributors! 🎉

[![Contributors](https://contrib.rocks/image?repo=yourusername/codoncraft)](https://github.com/yourusername/codoncraft/graphs/contributors)

*This project is made possible by the amazing contributions from our community.*

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by bioinformatics research needs
- Designed for educational and research purposes

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/codoncraft/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/codoncraft/wiki)
- **Email**: support@codoncraft.com

## 🔄 Version History

- **v1.0.0** - Initial release with basic codon analysis
- **v1.1.0** - Added advanced analytics and optimization insights
- **v1.2.0** - MongoDB integration and API endpoints

---

**Made with ❤️ for the bioinformatics community**
