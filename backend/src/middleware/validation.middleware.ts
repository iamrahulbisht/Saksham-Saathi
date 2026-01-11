import { Request, Response, NextFunction } from 'express';

export function validate(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Joi validation logic
        next();
    };
}
