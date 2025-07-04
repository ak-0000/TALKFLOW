import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const generateToken = (userId , res) => {
    const token = jwt.sign({userId}, process.env.JWTSECRET, {
        expiresIn: '7d'
    });
    res.cookie('jwt', token, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        samesite: 'strict',
        secure: process.env.NODE_ENV !== 'production' // Use secure cookies in production
     });

    return token ; 
}