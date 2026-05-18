"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || '', {
        expiresIn: (process.env.JWT_EXPIRE || '7d'),
    });
};
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, department, role } = req.body;
        const userExists = await models_1.User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await models_1.User.create({
            email,
            password,
            firstName,
            lastName,
            department,
            role: role || 'employee',
        });
        const token = generateToken(user.id);
        const userObj = user.toJSON();
        delete userObj.password;
        res.status(201).json({
            ...userObj,
            token,
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt: ${email}`);
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            console.log(`User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isPasswordMatch = await user.comparePassword(password);
        console.log(`Password match for ${email}: ${isPasswordMatch}`);
        if (isPasswordMatch) {
            const token = generateToken(user.id);
            const userObj = user.toJSON();
            delete userObj.password;
            res.json({
                ...userObj,
                token,
            });
        }
        else {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await models_1.User.findByPk(req.user.id);
        const userObj = user?.toJSON();
        delete userObj?.password;
        res.json(userObj);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMe = getMe;
