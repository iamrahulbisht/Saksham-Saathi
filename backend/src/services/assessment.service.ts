import prisma from '../config/database';
import { mlClient } from './ml.client';

 
const GAME_TYPES: Record<number, string> = {
    1: 'eye_tracking_reading',
    2: 'speech_fluency',
    3: 'handwriting',
    4: 'pattern_recognition',
    5: 'response_time',
};

 
const GAME_INSTRUCTIONS: Record<string, Record<number, { title: string; instructions: string; duration: number }>> = {
    en: {
        1: {
            title: 'Reading Task',
            instructions: 'Ensure your face is well-lit and camera is enabled. Follow the red dot to calibrate, then read the text naturally.',
            duration: 60,
        },
        2: {
            title: 'Speech Fluency',
            instructions: 'Read the sentences shown on screen clearly and at your normal pace.',
            duration: 30,
        },
        3: {
            title: 'Handwriting Task',
            instructions: 'Copy the letters and words shown on screen using the drawing area.',
            duration: 60,
        },
        4: {
            title: 'Pattern Recognition',
            instructions: 'Look at each pattern and select the correct answer.',
            duration: 120,
        },
        5: {
            title: 'Quick Response',
            instructions: 'Click the button as fast as you can when you see the colored circle.',
            duration: 60,
        },
    },
    hi: {
        1: {
            title: 'पढ़ने का कार्य',
            instructions: 'सुनिश्चित करें कि आपका चेहरा अच्छी तरह से प्रकाशित है और कैमरा सक्षम है। कैलिब्रेट करने के लिए लाल बिंदु का पालन करें, फिर पाठ को स्वाभाविक रूप से पढ़ें।',
            duration: 60,
        },
        2: {
            title: 'भाषण प्रवाह',
            instructions: 'स्क्रीन पर दिखाए गए वाक्यों को स्पष्ट रूप से और अपनी सामान्य गति से पढ़ें।',
            duration: 30,
        },
        3: {
            title: 'हस्तलेखन कार्य',
            instructions: 'ड्राइंग एरिया का उपयोग करके स्क्रीन पर दिखाए गए अक्षरों और शब्दों को कॉपी करें।',
            duration: 60,
        },
        4: {
            title: 'पैटर्न पहचान',
            instructions: 'प्रत्येक पैटर्न को देखें और सही उत्तर चुनें।',
            duration: 120,
        },
        5: {
            title: 'त्वरित प्रतिक्रिया',
            instructions: 'जब आप रंगीन वृत्त देखें तो जितनी जल्दी हो सके बटन पर क्लिक करें।',
            duration: 60,
        },
    },
};

 
const READING_PASSAGES: Record<string, string> = {
    en: `The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. 
    Reading is a wonderful skill that opens doors to new worlds. Every day, we learn something new through reading.
    Children who read regularly develop better vocabulary and comprehension skills. Books are treasures of knowledge.`,
    hi: `एक तेज भूरी लोमड़ी आलसी कुत्ते के ऊपर कूदती है। पढ़ना एक अद्भुत कौशल है जो नई दुनिया के दरवाजे खोलता है।
    हर दिन, हम पढ़ने के माध्यम से कुछ नया सीखते हैं। जो बच्चे नियमित रूप से पढ़ते हैं उनमें बेहतर शब्दावली और समझ कौशल विकसित होता है।`,
};

 
export async function startAssessment(studentId: string, language: string = 'en') {
     
    const student = await prisma.student.findUnique({
        where: { id: studentId },
    });

    if (!student) {
        throw new Error('Student not found');
    }

     
    const completedAssessment = await prisma.assessment.findFirst({
        where: { studentId, status: 'completed' },
        orderBy: { completedAt: 'desc' },  
    });

    if (completedAssessment) {
        return {
            assessmentId: completedAssessment.id,
            studentId: completedAssessment.studentId,
            language: completedAssessment.language,
            status: 'completed',
            startedAt: completedAssessment.startedAt,
            currentGame: 5,
            totalGames: 5,
            game: null,
        };
    }

     
    const existingAssessment = await prisma.assessment.findFirst({
        where: { studentId, status: 'in_progress' },
        orderBy: { createdAt: 'desc' },  
        include: { games: true },
    });

    if (existingAssessment) {
         
        const completedGamesCount = existingAssessment.games.length;
        if (completedGamesCount >= 5) {
             
            return {
                assessmentId: existingAssessment.id,
                studentId: existingAssessment.studentId,
                language: existingAssessment.language,
                status: 'completed',
                startedAt: existingAssessment.startedAt,
                currentGame: 5,
                totalGames: 5,
                game: null,
            };
        }

         
        const nextGameNumber = completedGamesCount + 1;
        const gameInstructions = GAME_INSTRUCTIONS[existingAssessment.language] || GAME_INSTRUCTIONS['en'];
        const nextGameInfo = gameInstructions[nextGameNumber];

        return {
            assessmentId: existingAssessment.id,
            studentId: existingAssessment.studentId,
            language: existingAssessment.language,
            status: existingAssessment.status,
            startedAt: existingAssessment.startedAt,
            currentGame: nextGameNumber,
            totalGames: 5,
            game: {
                gameNumber: nextGameNumber,
                gameType: GAME_TYPES[nextGameNumber],
                title: nextGameInfo.title,
                instructions: nextGameInfo.instructions,
                duration: nextGameInfo.duration,
                content: nextGameNumber === 1 ? {
                    passage: READING_PASSAGES[existingAssessment.language] || READING_PASSAGES['en']
                } : undefined,
            },
        };
    }

     
    const assessment = await prisma.assessment.create({
        data: {
            studentId,
            language,
            status: 'in_progress',
        },
    });

     
    const gameInstructions = GAME_INSTRUCTIONS[language] || GAME_INSTRUCTIONS['en'];
    const game1 = gameInstructions[1];

    return {
        assessmentId: assessment.id,
        studentId: assessment.studentId,
        language: assessment.language,
        status: assessment.status,
        startedAt: assessment.startedAt,
        currentGame: 1,
        totalGames: 5,
        game: {
            gameNumber: 1,
            gameType: GAME_TYPES[1],
            title: game1.title,
            instructions: game1.instructions,
            duration: game1.duration,
            content: {
                passage: READING_PASSAGES[language] || READING_PASSAGES['en'],
            },
        },
    };
}

 
export async function submitGameData(
    assessmentId: string,
    gameNumber: number,
    gameData: {
        eyeTrackingData?: any;
        speechAudioUrl?: string;
        speechTranscription?: string;
        handwritingStrokes?: any;
        responseData?: any;
        screenDimensions?: { width: number; height: number };
        textBoundingBox?: { top: number; left: number; width: number; height: number };
    }
) {
     
    if (gameNumber < 1 || gameNumber > 5) {
        throw new Error('Invalid game number');
    }

     
    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
    });

    if (!assessment) {
        throw new Error('Assessment not found');
    }

    if (assessment.status !== 'in_progress') {
        throw new Error('Assessment is not in progress');
    }

     

     
    if (gameNumber === 1 && gameData.eyeTrackingData?.rawPoints) {
        try {
            const analysisResult = await mlClient.analyzeReadingPatterns({
                gaze_points: gameData.eyeTrackingData.rawPoints,
                screen_width: gameData.screenDimensions?.width || 1920,
                screen_height: gameData.screenDimensions?.height || 1080,
                text_bbox: gameData.textBoundingBox
            });

             
            await prisma.mlPrediction.create({
                data: {
                    assessmentId,
                    predictionType: 'dyslexia_risk_eye_tracking',
                    riskScore: analysisResult.dyslexia_risk_score,
                    confidenceScore: 0.85,  
                    details: analysisResult as any,
                }
            });

             
            gameData.eyeTrackingData.analysis = analysisResult;
        } catch (error) {
            console.error('Failed to run ML analysis for game 1:', error);
        }
    }

     
    if (gameNumber === 2 && gameData.speechAudioUrl) {
        try {
             
             
            const port = process.env.PORT || 3000;
            const fullUrl = `http://localhost:${port}${gameData.speechAudioUrl}`;

            console.log(`Triggering speech analysis for: ${fullUrl}`);
            const analysisResult = await mlClient.analyzeSpeech(fullUrl);

             
            await prisma.mlPrediction.create({
                data: {
                    assessmentId,
                    predictionType: 'dyslexia_risk_speech',
                     
                     
                     
                    riskScore: analysisResult.fluency_score !== undefined ? (1 - analysisResult.fluency_score) : 0,
                    confidenceScore: 0.80,
                    details: analysisResult as any,
                }
            });

             
            if (analysisResult.transcription) {
                gameData.speechTranscription = analysisResult.transcription;
            }

        } catch (error) {
            console.error('Failed to run ML analysis for game 2:', error);
        }
    }

     
    const gameType = GAME_TYPES[gameNumber];
    const game = await prisma.assessmentGame.upsert({
        where: {
            assessmentId_gameNumber: {
                assessmentId,
                gameNumber,
            },
        },
        update: {
            eyeTrackingData: gameData.eyeTrackingData,
            speechAudioUrl: gameData.speechAudioUrl,
            speechTranscription: gameData.speechTranscription,
            handwritingStrokes: gameData.handwritingStrokes,
            responseData: gameData.responseData,
            completedAt: new Date(),
        },
        create: {
            assessmentId,
            gameNumber,
            gameType,
            eyeTrackingData: gameData.eyeTrackingData,
            speechAudioUrl: gameData.speechAudioUrl,
            speechTranscription: gameData.speechTranscription,
            handwritingStrokes: gameData.handwritingStrokes,
            responseData: gameData.responseData,
            completedAt: new Date(),
        },
    });

     
    const isLastGame = gameNumber === 5;
    const nextGameNumber = isLastGame ? null : gameNumber + 1;

     
    let nextGame = null;
    if (nextGameNumber) {
        const language = assessment.language || 'en';
        const gameInstructions = GAME_INSTRUCTIONS[language] || GAME_INSTRUCTIONS['en'];
        const nextGameInfo = gameInstructions[nextGameNumber];

        nextGame = {
            gameNumber: nextGameNumber,
            gameType: GAME_TYPES[nextGameNumber],
            title: nextGameInfo.title,
            instructions: nextGameInfo.instructions,
            duration: nextGameInfo.duration,
        };
    }

    return {
        gameId: game.id,
        gameNumber: game.gameNumber,
        status: 'completed',
        isLastGame,
        nextGame,
    };
}

 
export async function getAssessmentById(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    age: true,
                    grade: true,
                },
            },
            games: {
                orderBy: { gameNumber: 'asc' },
            },
            predictions: true,
        },
    });

    if (!assessment) {
        throw new Error('Assessment not found');
    }

    return assessment;
}

 
export async function getStudentAssessments(studentId: string) {
    const assessments = await prisma.assessment.findMany({
        where: { studentId },
        include: {
            games: {
                select: {
                    gameNumber: true,
                    gameType: true,
                    completedAt: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return assessments;
}

 
export async function completeAssessment(assessmentId: string) {
    const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: {
            games: true,
        },
    });

    if (!assessment) {
        throw new Error('Assessment not found');
    }

     
    if (assessment.games.length < 5) {
         
         
         
         
         
         
        if (assessment.games.length === 0) throw new Error('No games completed');
    }

     
    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - assessment.startedAt.getTime()) / 1000);

    const updated = await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
            status: 'completed',
            completedAt,
            durationSeconds,
        },
        include: {
            games: true,
            student: true
        },
    });

     
    try {
         
        const gamesData: Record<string, any> = {};
        updated.games.forEach((g: any) => {
            gamesData[`game${g.gameNumber}`] = {
                gameType: g.gameType,
                eyeTrackingData: g.eyeTrackingData,
                speechFluency: g.speechAudioUrl ? { url: g.speechAudioUrl, transcription: g.speechTranscription } : null,
                handwritingStrokes: g.handwritingStrokes,
                responseData: g.responseData,
                 
            };

             
             
        });

         
         
         
         
         
         
         
         

        const screeningResult = await mlClient.predictScreeningRisk({
            age: updated.student.age,
            gender: 'unknown',  
            games_data: gamesData
        });

         
        await prisma.mlPrediction.create({
            data: {
                assessmentId,
                studentId: updated.studentId,
                predictionType: 'screening_overall',
                dyslexiaRisk: screeningResult.risk_score,
                confidence: screeningResult.confidence,
                details: screeningResult,
            }
        });

         
        await prisma.student.update({
            where: { id: updated.studentId },
            data: {
                screeningStatus: 'completed',
                dyslexiaRisk: Math.round(screeningResult.risk_score * 100),  
                screeningConfidence: screeningResult.confidence,
                assessedAt: new Date()
            }
        });

    } catch (mlError) {
        console.error("Aggregation ML failed:", mlError);
         
    }

    return {
        assessmentId: updated.id,
        status: updated.status,
        completedAt: updated.completedAt,
        durationSeconds: updated.durationSeconds,
        gamesCompleted: updated.games.length,
    };
}
