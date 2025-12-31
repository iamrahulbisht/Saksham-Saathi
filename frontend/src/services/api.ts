import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

 
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

 
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

 
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

         
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                     
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                     
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

 
export const authAPI = {
    register: (data: {
        email: string;
        password: string;
        fullName: string;
        role: string;
        phone?: string;
        schoolCode?: string;
        languagePreference?: string;
    }) => api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    refresh: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),

    logout: (refreshToken?: string) =>
        api.post('/auth/logout', { refreshToken }),

    getProfile: () => api.get('/auth/profile'),
};

 
export const studentAPI = {
    createStudent: (data: {
        name: string;
        age: number;
        grade: number;
        parentEmails?: string[];
        languagePreference?: string;
    }) => api.post('/students', data),

    getMyStudents: () => api.get('/students/my-students'),

    getStudent: (studentId: string) => api.get(`/students/${studentId}`),

    assignTherapist: (studentId: string, therapistId: string) =>
        api.put(`/students/${studentId}/assign-therapist`, { therapistId }),
};

 
export const assessmentAPI = {
    startAssessment: (data: { studentId: string; language?: string }) =>
        api.post('/assessments/start', data),

    submitGame: (assessmentId: string, gameNumber: number, gameData: any) =>
        api.post(`/assessments/${assessmentId}/game/${gameNumber}/submit`, gameData),

    getAssessment: (assessmentId: string) =>
        api.get(`/assessments/${assessmentId}`),

    getStudentAssessments: (studentId: string) =>
        api.get(`/assessments/student/${studentId}`),

    completeAssessment: (assessmentId: string) =>
        api.post(`/assessments/${assessmentId}/complete`),
};

 
export const uploadAPI = {
    uploadAudio: (file: Blob | File) => {
        const formData = new FormData();
        formData.append('audio', file, 'recording.webm');
        return api.post('/upload/audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};

export default api;
