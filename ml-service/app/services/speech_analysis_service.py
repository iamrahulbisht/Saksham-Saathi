import librosa
import numpy as np

def analyze_speech(audio_file_path: str) -> dict:
    """
    Extract MFCC features and analyze speech clarity.
    Input: Path to audio file (or download from S3 URL)
    """
    try:
        # Load audio file (resample to 16kHz typical for speech models)
        y, sr = librosa.load(audio_file_path, sr=16000)
        
        # Extract MFCC features (13 coefficients standard for speech)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        
        # Calculate statistics
        mfcc_mean = np.mean(mfccs, axis=1) # Shape: (13,)
        mfcc_std = np.std(mfccs, axis=1)
        
        # Detect pauses (low energy regions)
        # RMS energy
        energy = librosa.feature.rms(y=y)[0]
        # Threshold: 10% of mean energy
        threshold = np.mean(energy) * 0.1
        pause_frames = np.sum(energy < threshold)
        # Convert frames to seconds (hop_length default 512)
        pause_duration = librosa.frames_to_time(pause_frames, sr=sr, hop_length=512)
        
        return {
            'mfcc_features': mfcc_mean.tolist(),
            'pause_count': int(pause_frames), # Proxy for count (contiguous regions need more logic)
            'total_pause_duration': float(pause_duration),
            'speech_rate': len(y) / sr,  # Duration in seconds
            'clarity_score': calculate_clarity_score(mfccs)
        }
    except Exception as e:
        return {'error': str(e)}

def calculate_clarity_score(mfccs):
    # Simple heuristic: higher variance in specific bands often correlates with clear articulation
    # (versus mumbling). This is a placeholder for a trained model score.
    variance = np.var(mfccs)
    # Normalize to 0-100 (Arbitrary scaling for prototype)
    return min(100, float(variance * 10))
