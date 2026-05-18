"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHoliday = exports.addHoliday = exports.getHolidays = void 0;
const Holiday_1 = __importDefault(require("../models/Holiday"));
const sequelize_1 = require("sequelize");
const getHolidays = async (req, res) => {
    try {
        const year = req.query.year;
        let query = {};
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            query = { date: { [sequelize_1.Op.between]: [startDate, endDate] } };
        }
        const holidays = await Holiday_1.default.findAll({ where: query, order: [['date', 'ASC']] });
        res.json(holidays);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getHolidays = getHolidays;
const addHoliday = async (req, res) => {
    try {
        const { date, name, isOptional } = req.body;
        const holiday = await Holiday_1.default.create({
            date: new Date(date),
            name,
            isOptional: isOptional || false,
        });
        res.status(201).json(holiday);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addHoliday = addHoliday;
const deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const holiday = await Holiday_1.default.findByPk(id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        await holiday.destroy();
        res.json({ message: 'Holiday deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteHoliday = deleteHoliday;
