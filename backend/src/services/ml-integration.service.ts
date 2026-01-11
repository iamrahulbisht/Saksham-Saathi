import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/api/ml';

export class MLIntegrationService {
    async analyzeHandwriting(imageUrl: string) {
        // Call ML Service API
        // Placeholder return until endpoint specific for handwriting features is made or part of screening
        return { score: 85 };
    }

    async predictScreening(data: any) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/screening/predict`, data);
            return response.data;
        } catch (error) {
            console.error("ML Screening Error", error);
            // Fallback
            return { dyslexiaRisk: 0, adhdRisk: 0, flags: ["Error calling ML Service"] };
        }
    }

    async detectCognitiveLoad(data: any) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/cognitive-load/detect`, data);
            return response.data;
        } catch (error) {
            console.error("ML Cognitive Load Error", error);
            return { overloadDetected: false };
        }
    }

    async predictAttention(data: any) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/attention/predict`, data);
            return response.data;
        } catch (error) {
            console.error("ML Attention Error", error);
            return { predictions: [] };
        }
    }
}
