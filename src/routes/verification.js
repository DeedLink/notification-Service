import express from'express';
import { Router } from 'express';
import nodemailer from 'nodemailer';
import {generateOTP} from '../utils/generateOTP.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: process.env.
    }
})