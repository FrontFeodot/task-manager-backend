import { Request, Response } from "express";

import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || ''

export const postSignup = async (req: Request, res: Response): Promise<void> => {
    const {email, password, confirmPassword} = req.body;

    if (password !== confirmPassword) {
        res.send('Password and confirm password are not matched');
    }

    try {
        const userData = await User.findOne({email})
        if (userData) {
            console.log('userData', userData)
            res.send('User with this email already exist')
        }
        return bcrypt.hash(password, 12).then(async (hashedPassword: string) => {
            const user = new User({
                email,
                password: hashedPassword
            })
            try {
                const result = await user.save();
                return console.log('result', result);
            } catch (err) {
                return console.log('saving error', err);
            }
        })
    } catch (err) {
        console.log(err)
    }
    
}

export const postLogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).send({ message: 'User not found' });
            return
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).send({ message: 'Invalid password' });
            return
        }

        const payload = { userId: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        res.cookie('authToken', token, {
            httpOnly: true,  // not allowed to js
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 3600 * 1000,  // expired time
        });

        res.status(200).send({ message: 'Login successful' });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error during login', err });
    }
};

export const getProtected = (req: Request, res: Response): void => {
    const token = req.cookies.authToken;  // get token from cookie

    if (!token) {
        res.status(401).send({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // 
        /* req.user = decoded;
        res.status(200).send({ message: 'Access granted', user: req.user }); */
    } catch (err) {
        console.error(err);
        res.status(401).send({ message: 'Invalid token' });
    }
};