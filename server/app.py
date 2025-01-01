from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import yt_dlp
import os
import subprocess
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'downloads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def convert_to_wav(input_path, output_path):
    command = [
        'ffmpeg',
        '-i', input_path,
        '-acodec', 'pcm_s16le',
        '-ar', '44100',
        output_path
    ]
    try:
        subprocess.run(command, check=True)
        return True
    except subprocess.CalledProcessError:
        return False

@app.route('/convert', methods=['POST'])
def convert_video():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({'error': 'No URL provided'}), 400

    url = data['url']
    video_id = url.split('v=')[-1]
    output_path = os.path.join(UPLOAD_FOLDER, f'{secure_filename(video_id)}')

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_path}.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        wav_path = f'{output_path}.wav'
        return jsonify({
            'success': True,
            'message': 'Conversion successful',
            'filename': os.path.basename(wav_path)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    try:
        return send_file(
            os.path.join(UPLOAD_FOLDER, filename),
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True)