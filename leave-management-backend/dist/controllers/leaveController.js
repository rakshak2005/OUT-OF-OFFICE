"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveStats = exports.cancelLeave = exports.updateLeaveStatus = exports.getPendingLeaves = exports.getAllLeaves = exports.getMyLeaves = exports.applyLeave = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
// Helper function to calculate working days (excluding weekends & holidays)
const calculateWorkingDays = async (fromDate, toDate) => {
    let workingDays = 0;
    const holidays = await models_1.Holiday.findAll({
        where: {
            date: {
                [sequelize_1.Op.between]: [fromDate, toDate],
            },
        },
    });
    const holidayDates = new Set(holidays.map((h) => h.date.toDateString()));
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toDateString();
        // Not weekend and not holiday
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
            workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return workingDays;
};
const applyLeave = async (req, res) => {
    try {
        const { leaveTypeId, fromDate, toDate, reason } = req.body;
        const userId = req.user.id;
        // Validation
        if (new Date(fromDate) > new Date(toDate)) {
            return res
                .status(400)
                .json({ message: 'From date must be before to date' });
        }
        if (reason.length < 10) {
            return res
                .status(400)
                .json({ message: 'Reason must be at least 10 characters' });
        }
        // Check for overlapping leaves
        const overlappingLeave = await models_1.Leave.findOne({
            where: {
                userId,
                status: { [sequelize_1.Op.in]: ['pending', 'approved'] },
                [sequelize_1.Op.or]: [
                    {
                        fromDate: { [sequelize_1.Op.lte]: toDate },
                        toDate: { [sequelize_1.Op.gte]: fromDate },
                    },
                ],
            },
        });
        if (overlappingLeave) {
            return res
                .status(400)
                .json({ message: 'You have overlapping leave dates' });
        }
        // Calculate working days
        const totalDays = await calculateWorkingDays(new Date(fromDate), new Date(toDate));
        if (totalDays <= 0) {
            return res
                .status(400)
                .json({ message: 'Invalid date range (includes only weekends/holidays)' });
        }
        // Check leave balance
        const currentYear = new Date().getFullYear();
        const leaveBalance = await models_1.LeaveBalance.findOne({
            where: {
                userId,
                leaveTypeId,
                year: currentYear,
            },
        });
        if (!leaveBalance || leaveBalance.remaining < totalDays) {
            return res
                .status(400)
                .json({ message: 'Insufficient leave balance' });
        }
        const leave = await models_1.Leave.create({
            userId,
            leaveTypeId,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            totalDays,
            reason,
            status: 'pending',
        });
        res.status(201).json(leave);
    }
    catch (error) {
        console.error('Error applying leave:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.applyLeave = applyLeave;
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await models_1.Leave.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: models_1.LeaveType,
                    as: 'leaveType',
                },
                {
                    model: models_1.User,
                    as: 'approver',
                    attributes: ['firstName', 'lastName'],
                },
            ],
            order: [['appliedAt', 'DESC']],
        });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyLeaves = getMyLeaves;
const getAllLeaves = async (req, res) => {
    try {
        const leaves = await models_1.Leave.findAll({
            include: [
                {
                    model: models_1.User,
                    as: 'applicant',
                    attributes: ['firstName', 'lastName', 'email', 'department'],
                },
                {
                    model: models_1.LeaveType,
                    as: 'leaveType',
                },
                {
                    model: models_1.User,
                    as: 'approver',
                    attributes: ['firstName', 'lastName'],
                },
            ],
            order: [['appliedAt', 'DESC']],
        });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllLeaves = getAllLeaves;
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await models_1.Leave.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: models_1.User,
                    as: 'applicant',
                    attributes: ['firstName', 'lastName', 'email', 'department'],
                },
                {
                    model: models_1.LeaveType,
                    as: 'leaveType',
                },
            ],
            order: [['appliedAt', 'DESC']],
        });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPendingLeaves = getPendingLeaves;
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, decisionRemark } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const leave = await models_1.Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        leave.status = status;
        leave.decidedBy = req.user.id;
        leave.decidedAt = new Date();
        if (status === 'rejected' && decisionRemark) {
            leave.decisionRemark = decisionRemark;
        }
        // Update leave balance if approved
        if (status === 'approved') {
            const currentYear = new Date().getFullYear();
            const leaveBalance = await models_1.LeaveBalance.findOne({
                where: {
                    userId: leave.userId,
                    leaveTypeId: leave.leaveTypeId,
                    year: currentYear,
                },
            });
            if (leaveBalance) {
                leaveBalance.used += leave.totalDays;
                leaveBalance.remaining -= leave.totalDays;
                await leaveBalance.save();
            }
        }
        await leave.save();
        res.json(leave);
    }
    catch (error) {
        console.error('Error updating leave:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
const cancelLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await models_1.Leave.findByPk(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        if (leave.status === 'approved') {
            return res
                .status(400)
                .json({
                message: 'Cannot cancel approved leave. Contact manager for revoke.',
            });
        }
        if (leave.status === 'cancelled') {
            return res.status(400).json({ message: 'Leave already cancelled' });
        }
        leave.status = 'cancelled';
        await leave.save();
        res.json(leave);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.cancelLeave = cancelLeave;
const getLeaveStats = async (req, res) => {
    try {
        const stats = await models_1.Leave.findAll({
            where: { userId: req.user.id },
            attributes: ['status', [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']],
            group: ['status'],
            raw: true,
        });
        const formatted = {
            totalLeaves: 0,
            pendingLeaves: 0,
            approvedLeaves: 0,
            rejectedLeaves: 0,
        };
        stats.forEach((stat) => {
            formatted.totalLeaves += parseInt(stat.count);
            if (stat.status === 'pending')
                formatted.pendingLeaves = parseInt(stat.count);
            if (stat.status === 'approved')
                formatted.approvedLeaves = parseInt(stat.count);
            if (stat.status === 'rejected')
                formatted.rejectedLeaves = parseInt(stat.count);
        });
        res.json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getLeaveStats = getLeaveStats;
