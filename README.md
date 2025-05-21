# 🎯 Presentify

<div align="center">
  <img src="docs/logo.png" alt="Presentify Logo" width="200"/>
  <h3>AI-Powered Presentation Creator</h3>
  <p>Transform your ideas into stunning presentations in minutes</p>
</div>

---

## ✨ Features

- 🤖 **AI-Powered Content Generation**: Leverages advanced LLM technology to create structured, meaningful content
- 🎨 **Beautiful Design**: Modern UI with glassmorphism effects and smooth animations
- 🖼️ **Smart Image Integration**: Automatically fetches relevant images using Unsplash API
- 📊 **Dynamic Layouts**: Intelligent slide layouts based on content type
- 🎬 **Interactive Animations**: Multiple animation options for engaging presentations
- 💾 **PowerPoint Export**: Export presentations in PPTX format

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (3.8 or higher)
- Git

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/SaiPavankumar22/Presentify.git
   cd Presentify
   ```

2. Set up backend environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Create a .env file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   UNSPLASH_ACCESS_KEY=your_unsplash_api_key
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## 🎮 Usage

1. Start the backend server:
   ```bash
   python app.py
   ```

2. Start the frontend development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

## 🔄 How It Works

### Presentation Generation Workflow

1. **Content Analysis**
   - User inputs topic and desired number of slides
   - AI analyzes the content and determines optimal structure

2. **Slide Generation**
   - Creates title slide with main topic
   - Generates content slides with key points
   - Structures information hierarchically

3. **Visual Enhancement**
   - Fetches relevant images from Unsplash
   - Applies appropriate animations
   - Optimizes layout and formatting

4. **Export Process**
   - Converts slide data to PPTX format
   - Preserves styling and animations
   - Generates downloadable presentation

## 🛠️ Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Lucide Icons** for UI elements
- **pptxgenjs** for PowerPoint export

### Backend
- **Flask** for API server
- **Langchain** with Groq for AI processing
- **Unsplash API** for image integration

## 📝 Project Structure

```
presentify/
├── backend/
│   ├── app.py              # Flask server and API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.tsx       # Main application
│   │   └── ...
│   ├── package.json
│   └── ...
├── .env                    # Environment variables
├── LICENSE                 # MIT license
└── README.md              # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for AI processing
- [Unsplash](https://unsplash.com/) for image integration
- [Lucide](https://lucide.dev/) for beautiful icons
- All contributors and supporters

---

<div align="center">
  <p>Made with ❤️ by Devisetti Sai Pavan kumar</p>
</div>

<p></p>
  <p>
    <a href="https://github.com/SaiPavankumar22/Presentify/issues">Report Bug</a> ·
    <a href="https://github.com/SaiPavankumar22/Presentify/issues">Request Feature</a>
  </p>
</div> 