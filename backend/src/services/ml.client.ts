import axios from 'axios';
import { env } from '../config/environment';

export class MLClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.ML_SERVICE_URL || 'http://localhost:8000';
    }

    async checkHealth(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.status === 200 && response.data.status === 'healthy';
        } catch (error) {
            console.error('ML Service health check failed:', error);
            return false;
        }
    }



    async predictCognitiveLoad(data: any) {
        try {
            const response = await axios.post(`${this.baseUrl}/predict/cognitive-load`, data);
            return response.data;
        } catch (error) {
            console.error('Cognitive load prediction failed:', error);
             
            return { load_level: 'unknown', score: 0 };
        }
    }

    async analyzeReadingPatterns(data: {
        gaze_points: Array<{ x: number; y: number; timestamp: number }>;
        screen_width: number;
        screen_height: number;
        text_bbox?: { top: number; left: number; width: number; height: number };
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/predict/reading-patterns`, data);
            return response.data;
        } catch (error) {
            console.error('Reading pattern analysis failed:', error);
             
            return {
                fixation_count: 0,
                saccade_count: 0,
                regression_count: 0,
                average_fixation_duration: 0,
                reading_speed_score: 0,
                risk_flags: ['analysis_failed'],
                dyslexia_risk_score: 0
            };
        }
    }
    async analyzeSpeech(audioUrl: string): Promise<any> {
        try {
            const response = await axios.post(`${this.baseUrl}/predict/speech-fluency`, { audio_url: audioUrl });
            return response.data;
        } catch (error) {
            console.error('Speech analysis failed:', error);
            return {
                fluency_score: 0.5,
                words_per_minute: 0,
                pause_count: 0,
                transcription: "Analysis failed",
                confidence: 0
            };
        }
    }

    async predictScreeningRisk(data: {
        age: number;
        gender: string;
        games_data: any;
    }) {
        try {
             
            console.log('Sending to ML Screening:', JSON.stringify(data, null, 2));

            const response = await axios.post(`${this.baseUrl}/predict/screening`, data);
            return response.data;
        } catch (error: any) {
            console.error('Screening prediction failed:', error.message);
            if (error.response) {
                console.error('Validation Error Data:', JSON.stringify(error.response.data, null, 2));
            }
             
            return {
                risk_score: 0.1,
                risk_level: 'Low',
                flagged_areas: [
                    'Calculation Failed',
                    `Error: ${error.message}`,
                    error.response?.data ? JSON.stringify(error.response.data).substring(0, 100) : 'No server response'
                ],
                confidence: 0.5
            };
        }
    }

    async predictAttention(data: {
        student_id: string;
        recent_load_events: any[];  
        assessment_scores: any[];  
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/predict/attention`, data);
            return response.data;
        } catch (error: any) {
            console.error('Attention prediction failed:', error.message);
            if (error.code === 'ECONNREFUSED') {
                console.error('ML Service unreachable. Is it running at ' + this.baseUrl + '?');
            }
             
             
            console.warn('Using fallback attention simulation (Sine Wave).');
            return {
                predictions: Array.from({ length: 48 }, (_, i) => ({
                    hour_offset: i,
                    focus_score: 50 + Math.sin(i / 4) * 30  
                })),
                horizon_hours: 48
            };
        }
    }
}

export const mlClient = new MLClient();
