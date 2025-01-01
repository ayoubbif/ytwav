from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import os
from werkzeug.utils import secure_filename
import base64
from typing import Dict, Any

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'downloads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_audio_format_info(url: str) -> Dict[str, Any]:
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)

def convert_video(url: str, output_path: str) -> Dict[str, Any]:
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_path}.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
            'nopostoverwrites': False
        }],
        'ffmpeg_location': None,  # Set your ffmpeg path if needed
        'quiet': True,
        'no_warnings': True,
        'extract_audio': True,
        'audioformat': 'wav',
        'audioquality': 0,  # Best quality
        'prefer_ffmpeg': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=True)

@app.route('/convert', methods=['POST'])
def handle_conversion():
    try:
        data = request.get_json()
        if not data or 'url' not in data:
            return jsonify({'error': 'No URL provided'}), 400

        url = data['url']
        video_id = url.split('v=')[-1]
        output_path = os.path.join(UPLOAD_FOLDER, secure_filename(video_id))

        # Get video info first
        info = get_audio_format_info(url)
        if not info:
            return jsonify({'error': 'Could not fetch video information'}), 400

        # Convert video
        info = convert_video(url, output_path)
        wav_path = f'{output_path}.wav'

        if not os.path.exists(wav_path):
            return jsonify({'error': 'Conversion failed'}), 500

        with open(wav_path, 'rb') as file:
            audio_data = base64.b64encode(file.read()).decode('utf-8')

        os.remove(wav_path)

        return jsonify({
            'success': True,
            'message': 'Conversion successful',
            'filename': secure_filename(f'{info["title"]}.wav'),
            'audio_data': audio_data,
            'duration': info.get('duration'),
            'format': 'wav'
        })

    except yt_dlp.utils.DownloadError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)