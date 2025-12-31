import Joi from 'joi';

 
export const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            'any.required': 'Password is required',
        }),
    fullName: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters',
            'any.required': 'Full name is required',
        }),
    role: Joi.string()
        .valid('teacher', 'therapist', 'parent', 'admin')
        .required()
        .messages({
            'any.only': 'Role must be one of: teacher, therapist, parent, admin',
            'any.required': 'Role is required',
        }),
    phone: Joi.string()
        .pattern(/^\+?[1-9]\d{9,14}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number',
        }),
    schoolCode: Joi.string()
        .optional()
        .messages({
            'string.base': 'School code must be a string',
        }),
    languagePreference: Joi.string()
        .valid('en', 'hi', 'ta', 'te', 'mr', 'bn', 'gu')
        .default('en'),
});

 
export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required',
        }),
});

 
export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'any.required': 'Refresh token is required',
        }),
});
