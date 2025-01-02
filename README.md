# ytwav 🎵

A fast and efficient YouTube to WAV converter with a modern web interface. Convert YouTube videos to high-quality WAV audio files with just a few clicks.

## 🚀 Features

- Clean, intuitive user interface
- High-quality audio extraction
- Real-time conversion progress tracking
- Secure file handling and processing
- Docker-ready deployment
- Efficient memory management
- Response caching for better performance

## 🛠️ Tech Stack

- **Frontend**: Vite + TypeScript
- **Backend**: Flask
- **Infrastructure**: Docker & Docker Compose

## 🏃‍♂️ Quick Start

1. Clone the repository:

```bash
git clone https://github.com/ayoubbif/ytwav.git
cd ytwav
```

2. Start the application using Docker Compose:

```bash
docker-compose up --build
```

3. Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 API Usage

Convert a YouTube video to WAV:

```bash
curl -X POST http://localhost:5000/convert \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=..."}'
```

## 🚧 Roadmap

- Rate limiting implementation
- User authentication
- File size limits
- WebSocket progress updates
- Audio format selection
- Batch processing support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is intended for personal use only. Please respect YouTube's terms of service and copyright laws when using this converter.
