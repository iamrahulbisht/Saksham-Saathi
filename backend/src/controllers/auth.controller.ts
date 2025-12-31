import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as authService from '../services/auth.service';

 
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password, fullName, role, phone, schoolCode, languagePreference } = req.body;

        const result = await authService.registerUser({
            email,
            password,
            fullName,
            role,
            phone,
            schoolCode,
            languagePreference,
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                res.status(409).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            if (error.message.includes('Invalid school code')) {
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        next(error);
    }
};

 
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser({ email, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Invalid email or password') || error.message.includes('deactivated')) {
                res.status(401).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        next(error);
    }
};

 
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
                expiresIn: result.expiresIn,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Invalid') || error.message.includes('expired') || error.message.includes('revoked')) {
                res.status(401).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
        }
        next(error);
    }
};

 
export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { refreshToken } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }

        await authService.logoutUser(userId, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(error);
    }
};

 
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }

        const user = await authService.getUserById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};
