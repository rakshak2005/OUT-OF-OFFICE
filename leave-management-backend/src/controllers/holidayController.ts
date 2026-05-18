import { Request, Response } from 'express';
import Holiday from '../models/Holiday';
import { Op } from 'sequelize';

export const getHolidays = async (req: Request, res: Response) => {
  try {
    const year = req.query.year as string;
    let query: any = {};

    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      query = { date: { [Op.between]: [startDate, endDate] } };
    }

    const holidays = await Holiday.findAll({ where: query, order: [['date', 'ASC']] });
    res.json(holidays);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addHoliday = async (req: Request, res: Response) => {
  try {
    const { date, name, isOptional } = req.body;

    const holiday = await Holiday.create({
      date: new Date(date),
      name,
      isOptional: isOptional || false,
    });

    res.status(201).json(holiday);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id as string);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await holiday.destroy();

    res.json({ message: 'Holiday deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};