import axios from 'axios';
import { saveToSyncQueue } from './indexedDB';

const api = axios.create({ baseURL: 'http://localhost:3000/api/v1' });

// Request Interceptor (Inject Token, Check Online)
api.interceptors.request.use(async (config) => {
    // Inject Auth Token
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Bypass offline queue check if this is a sync request
    if (config.headers['X-Sync-Request']) {
        return config;
    }

    if (!navigator.onLine && config.method !== 'get') {
        const dataType = extractDataType(config.url);

        // Only queue mutations
        const method = config.method?.toLowerCase() || '';
        if (['post', 'put', 'patch', 'delete'].includes(method)) {
            await saveToSyncQueue(dataType, 'create', {
                url: config.url,
                method: config.method,
                data: config.data
            });
            throw new Error('OFFLINE_QUEUED');
        }
    }

    return config;
});

// Response Interceptor (Handle Offline Error)
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.message === 'OFFLINE_QUEUED') {
            // Fake a success response to keep UI happy
            return Promise.resolve({
                data: { message: 'Saved offline' },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: error.config || {}
            });
        }
        return Promise.reject(error);
    }
);

function extractDataType(url: string = ''): string {
    if (url.includes('student')) return 'student';
    if (url.includes('assessment')) return 'assessment';
    return 'api_call';
}

export default api;
