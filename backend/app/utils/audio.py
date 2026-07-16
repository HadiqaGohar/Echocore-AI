import os
import tempfile


def convert_webm_to_wav(webm_path: str) -> str:
    """Convert WebM audio to WAV using pydub (requires ffmpeg)."""
    from pydub import AudioSegment

    audio = AudioSegment.from_file(webm_path)
    wav_path = webm_path.rsplit(".", 1)[0] + ".wav"
    audio.export(wav_path, format="wav")
    return wav_path


def save_upload_to_temp(file_bytes: bytes, suffix: str = ".webm") -> str:
    """Save uploaded bytes to a temp file and return the path."""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    tmp.write(file_bytes)
    tmp.close()
    return tmp.name


def cleanup_file(path: str):
    """Remove a temp file if it exists."""
    try:
        os.unlink(path)
    except OSError:
        pass
