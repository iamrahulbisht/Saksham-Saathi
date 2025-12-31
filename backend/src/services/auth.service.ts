import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/environment';
import { Role } from '@prisma/client';

interface RegisterInput {
    email: string;
    password: string;
    fullName: string;
    role: Role;
    phone?: string;
    schoolCode?: string;
    languagePreference?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

interface UserResponse {
    userId: string;
    email: string;
    fullName: string;
    role: Role;
    languagePreference: string;
}

 
const generateTokens = (userId: string, email: string, role: Role): TokenPair => {
    const accessToken = jwt.sign(
        { userId, email, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId, email, role },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return {
        accessToken,
        refreshToken,
        expiresIn: env.JWT_EXPIRES_IN,
    };
};

 
const parseDuration = (duration: string): number => {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;  

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return 7 * 24 * 60 * 60 * 1000;
    }
};

 
export const registerUser = async (input: RegisterInput): Promise<{ user: UserResponse; tokens: TokenPair }> => {
    const { email, password, fullName, role, phone, schoolCode, languagePreference } = input;

     
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

     
    let schoolId: string | null = null;
    if (schoolCode) {
        const school = await prisma.school.findUnique({
            where: { schoolCode },
        });
        if (!school) {
            throw new Error('Invalid school code');
        }
        schoolId = school.id;
    }

     
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

     
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            fullName,
            role,
            phone,
            schoolId,
            languagePreference: languagePreference || 'en',
        },
    });

     
    const tokens = generateTokens(user.id, user.email, user.role);

     
    const expiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));
    await prisma.refreshToken.create({
        data: {
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt,
        },
    });

    return {
        user: {
            userId: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            languagePreference: user.languagePreference,
        },
        tokens,
    };
};

 
export const loginUser = async (input: LoginInput): Promise<{ user: UserResponse; tokens: TokenPair }> => {
    const { email, password } = input;

     
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
        throw new Error('Account is deactivated');
    }

     
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

     
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
    });

     
    const tokens = generateTokens(user.id, user.email, user.role);

     
    const expiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES_IN));
    await prisma.refreshToken.create({
        data: {
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt,
        },
    });

    return {
        user: {
            userId: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            languagePreference: user.languagePreference,
        },
        tokens,
    };
};

 
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> => {
     
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
    });

    if (!storedToken) {
        throw new Error('Invalid refresh token');
    }

    if (storedToken.revoked) {
        throw new Error('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
        throw new Error('Refresh token has expired');
    }

     
    try {
        jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }

     
    const accessToken = jwt.sign(
        { userId: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
        accessToken,
        expiresIn: env.JWT_EXPIRES_IN,
    };
};

 
export const logoutUser = async (userId: string, refreshToken?: string): Promise<void> => {
    if (refreshToken) {
         
        await prisma.refreshToken.updateMany({
            where: { token: refreshToken, userId },
            data: { revoked: true },
        });
    } else {
         
        await prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true },
        });
    }
};

 
export const getUserById = async (userId: string): Promise<UserResponse | null> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) return null;

    return {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        languagePreference: user.languagePreference,
    };
};
