import Joi from 'joi';

 
export const createStudentSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'any.required': 'Name is required',
        }),
    age: Joi.number()
        .integer()
        .min(4)
        .max(18)
        .required()
        .messages({
            'number.min': 'Age must be at least 4',
            'number.max': 'Age must be at most 18',
            'any.required': 'Age is required',
        }),
    grade: Joi.number()
        .integer()
        .min(1)
        .max(12)
        .required()
        .messages({
            'number.min': 'Grade must be at least 1',
            'number.max': 'Grade must be at most 12',
            'any.required': 'Grade is required',
        }),
    parentEmails: Joi.array()
        .items(Joi.string().email())
        .optional()
        .messages({
            'string.email': 'Parent emails must be valid email addresses',
        }),
    languagePreference: Joi.string()
        .valid('en', 'hi', 'ta', 'te', 'mr', 'bn', 'gu')
        .default('en'),
});

 
export const assignTherapistSchema = Joi.object({
    therapistId: Joi.string()
        .uuid()
        .required()
        .messages({
            'any.required': 'Therapist ID is required',
            'string.guid': 'Therapist ID must be a valid UUID',
        }),
});
