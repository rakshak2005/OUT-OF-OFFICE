import { Response } from 'express';
import { Op, fn, col } from 'sequelize';
import { Leave, User, LeaveType, LeaveBalance, Holiday } from '../models';
import { AuthRequest } from '../middleware/authMiddleware';
import { emailService } from '../services/emailService';
import fs from 'fs';
import path from 'path';
import https from 'https';

const calculateWorkingDays = async (
  fromDate: Date,
  toDate: Date
): Promise<number> => {
  let workingDays = 0;
  const holidays = await Holiday.findAll({
    where: {
      date: {
        [Op.between]: [fromDate, toDate],
      },
    },
  });

  const holidayDates = new Set(
    holidays.map((h) => h.date.toDateString())
  );

  const currentDate = new Date(fromDate);
  while (currentDate <= toDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toDateString();

    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidayDates.has(dateStr)) {
      workingDays++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

export const applyLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { leaveType, startDate: fromDate, endDate: toDate, reason, document, documentName } = req.body;
    const userId = req.user.id;

    const typeRecord = await LeaveType.findOne({
      where: { name: { [Op.iLike]: `%${leaveType}%` } }
    });

    if (!typeRecord) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }
    const leaveTypeId = typeRecord.id;

    
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

    
    const overlappingLeave = await Leave.findOne({
      where: {
        userId,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          {
            fromDate: { [Op.lte]: toDate },
            toDate: { [Op.gte]: fromDate },
          },
        ],
      },
    });

    if (overlappingLeave) {
      return res
         .status(400)
         .json({ message: 'You have overlapping leave dates' });
    }

    
    const totalDays = await calculateWorkingDays(
      new Date(fromDate),
      new Date(toDate)
    );

    if (totalDays <= 0) {
      return res
         .status(400)
         .json({ message: 'Invalid date range (includes only weekends/holidays)' });
    }

    
    const currentYear = new Date().getFullYear();
    let leaveBalance = await LeaveBalance.findOne({
      where: {
        userId,
        leaveTypeId,
        year: currentYear,
      },
    });

    
    if (!leaveBalance) {
      leaveBalance = await LeaveBalance.create({
        userId,
        leaveTypeId,
        year: currentYear,
        allocated: typeRecord.annualQuota,
        remaining: typeRecord.annualQuota,
        used: 0,
        carriedForward: 0,
      });
    }

    if (leaveBalance.remaining < totalDays) {
      return res
         .status(400)
         .json({ message: 'Insufficient leave balance' });
    }

    
    let documentPath = null;
    if (document && documentName) {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const matches = document.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${Date.now()}-${documentName.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        documentPath = `/uploads/${filename}`;
      }
    }

    const leave = await Leave.create({
      userId,
      leaveTypeId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      totalDays,
      reason,
      status: 'pending',
      documentPath: documentPath || undefined,
    });

    
    (async () => {
      try {
        const applicant = await User.findByPk(userId);
        if (!applicant) return;

        let managerEmail = 'hr@company.com';
        let managerName = 'HR Desk';

        if (applicant.managerId) {
          const manager = await User.findByPk(applicant.managerId);
          if (manager) {
            managerEmail = manager.email;
            managerName = `${manager.firstName} ${manager.lastName}`;
          }
        } else {
          
          const fallbackManager = await User.findOne({ where: { role: 'manager' } });
          if (fallbackManager) {
            managerEmail = fallbackManager.email;
            managerName = `${fallbackManager.firstName} ${fallbackManager.lastName}`;
          }
        }

        await emailService.sendLeavePendingApprovalEmail(
          managerEmail,
          managerName,
          `${applicant.firstName} ${applicant.lastName}`,
          typeRecord.name,
          new Date(fromDate).toLocaleDateString('en-US', { dateStyle: 'medium' }),
          new Date(toDate).toLocaleDateString('en-US', { dateStyle: 'medium' }),
          totalDays,
          reason
        );
      } catch (mailErr) {
        console.error('Error triggering pending leave email:', mailErr);
      }
    })();

    res.status(201).json(leave);
  } catch (error: any) {
    console.error('Error applying leave:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await Leave.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: LeaveType,
          as: 'leaveType',
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['appliedAt', 'DESC']],
    });

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await Leave.findAll({
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['firstName', 'lastName', 'email', 'department'],
        },
        {
          model: LeaveType,
          as: 'leaveType',
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['appliedAt', 'DESC']],
    });

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await Leave.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['firstName', 'lastName', 'email', 'department'],
          include: [
            {
              model: Leave,
              as: 'leaves',
              where: { status: 'approved' },
              required: false,
              limit: 5,
              order: [['fromDate', 'DESC']],
              include: [{ model: LeaveType, as: 'leaveType' }]
            }
          ]
        },
        {
          model: LeaveType,
          as: 'leaveType',
        },
      ],
      order: [['appliedAt', 'DESC']],
    });

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, decisionRemark } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await Leave.findByPk(id as string);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    
    if (leave.userId === req.user.id) {
      return res.status(403).json({ message: 'Access denied: You cannot approve or reject your own leave request' });
    }

    const applicant = await User.findByPk(leave.userId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    
    if (req.user.role === 'manager' && applicant.managerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You are not the assigned manager for this employee' });
    }

    
    if (status === 'rejected' && (!decisionRemark || decisionRemark.trim() === '')) {
      return res.status(400).json({ message: 'A decision remark is required when rejecting a leave request' });
    }

    leave.status = status as any;
    leave.decidedBy = req.user.id;
    leave.decidedAt = new Date();

    if (status === 'rejected' && decisionRemark) {
      leave.decisionRemark = decisionRemark;
    }

    
    if (status === 'approved') {
      const currentYear = new Date().getFullYear();
      const leaveBalance = await LeaveBalance.findOne({
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

    
    (async () => {
      try {
        const applicant = await User.findByPk(leave.userId);
        const approver = await User.findByPk(req.user.id);
        const lType = await LeaveType.findByPk(leave.leaveTypeId);
        if (!applicant) return;

        const approverName = approver ? `${approver.firstName} ${approver.lastName}` : 'System Administrator';
        const typeName = lType ? lType.name : 'Leave';

        await emailService.sendLeaveStatusEmail(
          applicant.email,
          `${applicant.firstName} ${applicant.lastName}`,
          typeName,
          new Date(leave.fromDate).toLocaleDateString('en-US', { dateStyle: 'medium' }),
          new Date(leave.toDate).toLocaleDateString('en-US', { dateStyle: 'medium' }),
          leave.totalDays,
          status as 'approved' | 'rejected',
          approverName,
          decisionRemark || leave.decisionRemark
        );
      } catch (mailErr) {
        console.error('Error triggering leave status update email:', mailErr);
      }
    })();

    res.json(leave);
  } catch (error: any) {
    console.error('Error updating leave:', error);
    res.status(500).json({ message: error.message });
  }
};

export const cancelLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    
    if (leave.userId !== (req as any).user.id && !['manager', 'hr', 'admin'].includes((req as any).user.role)) {
      return res.status(403).json({ message: 'You are not authorized to cancel this leave request' });
    }

    
    if (leave.status === 'approved' && leave.userId === req.user.id && req.user.role === 'employee') {
      return res.status(400).json({ message: 'Cannot cancel a leave request that is already approved. Please contact your manager to revoke it.' });
    }

    
    const fromDate = new Date(leave.fromDate);
    fromDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = fromDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 3) {
      return res.status(400).json({
        message: `Cancellation window closed. Leaves can only be cancelled at least 3 days prior to start. (Remaining: ${diffDays < 0 ? 0 : diffDays} day(s))`
      });
    }

    const previousStatus = leave.status;
    leave.status = 'cancelled';
    await leave.save();

    
    if (previousStatus === 'approved') {
      const currentYear = new Date(leave.fromDate).getFullYear();
      const leaveBalance = await LeaveBalance.findOne({
        where: { userId: leave.userId, leaveTypeId: leave.leaveTypeId, year: currentYear }
      });
      if (leaveBalance) {
        leaveBalance.used = Math.max(0, leaveBalance.used - leave.totalDays);
        leaveBalance.remaining += leave.totalDays;
        await leaveBalance.save();
      }
    }

    res.json({ message: 'Leave request cancelled successfully', leave });
  } catch (error: any) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: error.message || 'Failed to cancel leave' });
  }
};

export const getLeaveStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Leave.findAll({
      where: { userId: req.user.id },
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const formatted = {
      totalLeaves: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
    };

    (stats as any[]).forEach((stat: any) => {
      formatted.totalLeaves += parseInt(stat.count);
      if (stat.status === 'pending') formatted.pendingLeaves = parseInt(stat.count);
      if (stat.status === 'approved') formatted.approvedLeaves = parseInt(stat.count);
      if (stat.status === 'rejected') formatted.rejectedLeaves = parseInt(stat.count);
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAiAssist = async (req: AuthRequest, res: Response) => {
  try {
    const { draft, tone } = req.body;
    if (!draft || draft.trim().length < 3) {
      return res.status(400).json({ message: 'Draft must be at least 3 characters' });
    }

    let suggestion = '';
    const cleanDraft = draft.trim();

    if (tone === 'medical') {
      suggestion = `Dear Management,\n\nI am writing to formally request medical leave as I am currently feeling unwell and need to focus on recovery (${cleanDraft}). I plan to consult a healthcare professional and will ensure a smooth handover of any outstanding priorities. Thank you for your support.`;
    } else if (tone === 'formal') {
      suggestion = `Dear Management,\n\nI am writing to formally request leave for the following personal reason: ${cleanDraft.toLowerCase()}. I have organized my current tasks to ensure no disruption to the team's ongoing deliverables during my absence. Thank you for your understanding.`;
    } else if (tone === 'vacation') {
      suggestion = `Hi Team,\n\nI would like to request leave for a planned holiday: ${cleanDraft}. I have pre-scheduled my deliverables and delegated crucial workflows to ensure continuous progress while I am away. Thank you.`;
    } else if (tone === 'urgent') {
      suggestion = `Urgent Leave Request\n\nDear Management,\n\nI am writing to request immediate leave due to an unexpected personal emergency: ${cleanDraft}. I will try to monitor urgent communications where possible, but my main focus will be addressing this emergency. Thank you for your understanding.`;
    } else {
      suggestion = `Leave Request:\n\nI am requesting time off to attend to: ${cleanDraft}. I will ensure all critical tasks are addressed or delegated before my departure. Thank you.`;
    }

    res.json({ suggestion });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'AI Assist failed to generate suggestion' });
  }
};

export const getActiveTodayLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const activeLeaves = await Leave.findAll({
      where: {
        status: 'approved',
        fromDate: { [Op.lte]: endOfToday },
        toDate: { [Op.gte]: startOfToday },
      },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['firstName', 'lastName', 'department', 'email'],
        },
        {
          model: LeaveType,
          as: 'leaveType',
          attributes: ['name'],
        },
      ],
      order: [['fromDate', 'ASC']],
    });

    res.json(activeLeaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch active leaves' });
  }
};

export const getLeaveById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['firstName', 'lastName', 'department', 'email'],
        },
        {
          model: LeaveType,
          as: 'leaveType',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'approver',
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    
    if (
      leave.userId !== req.user.id &&
      req.user.role !== 'manager' &&
      req.user.role !== 'hr' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied: Unauthorized view request' });
    }

    res.json(leave);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave details' });
  }
};

export const getTeamCalendarLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const leaves = await Leave.findAll({
      where: {
        status: 'approved',
      },
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['firstName', 'lastName', 'department'],
        },
        {
          model: LeaveType,
          as: 'leaveType',
          attributes: ['name'],
        },
      ],
      order: [['fromDate', 'ASC']],
    });

    res.json(leaves);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch team calendar' });
  }
};

export const getAiChatResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = (req as any).user.id;
    const cleanMsg = message.trim().toLowerCase();

    
    const currentUser = await User.findByPk(userId);
    const currentYear = new Date().getFullYear();

    const [managers, leaves, holidays, balances] = await Promise.all([
      User.findAll({ 
        where: { role: 'manager' }, 
        attributes: ['firstName', 'lastName', 'email', 'department'] 
      }),
      Leave.findAll({
        include: [
          { model: User, as: 'applicant', attributes: ['firstName', 'lastName', 'department', 'email'] },
          { model: LeaveType, as: 'leaveType', attributes: ['name'] }
        ]
      }),
      Holiday.findAll({ order: [['date', 'ASC']] }),
      LeaveBalance.findAll({
        where: { userId, year: currentYear },
        include: [{ model: LeaveType, as: 'leaveType' }]
      })
    ]);

    
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim().length > 0) {
      try {
        const todayStr = new Date().toDateString();
        
        const userContext = `
        <current_user>
        Name: ${currentUser?.firstName || 'User'} ${currentUser?.lastName || ''}
        Email: ${currentUser?.email}
        Role: ${currentUser?.role}
        Department: ${currentUser?.department || 'Unassigned'}
        Today's Date: ${todayStr}
        </current_user>
        `;

        const managerContext = managers.map((m: any) => `* ${m.firstName} ${m.lastName} (${m.department || 'Unassigned'} Department) - Email: ${m.email}`).join('\n');
        
        const leaveContext = leaves.map((l: any) => {
          const status = l.status;
          const applicantName = l.applicant ? `${l.applicant.firstName} ${l.applicant.lastName}` : 'Unknown';
          const dept = l.applicant ? l.applicant.department : 'Unknown';
          const leaveName = l.leaveType ? l.leaveType.name : 'Leave';
          const from = new Date(l.fromDate).toDateString();
          const to = new Date(l.toDate).toDateString();
          return `* ${applicantName} (${dept}) on ${leaveName} (${from} to ${to}) - Status: ${status} (Reason: ${l.reason || 'No reason provided'})`;
        }).join('\n');

        const holidayContext = holidays.map((h: any) => `* ${h.name} on ${new Date(h.date).toDateString()} (Optional: ${h.isOptional})`).join('\n');

        const balanceContext = balances.map((b: any) => {
          const name = b.leaveType ? b.leaveType.name : 'Other';
          return `* ${name}: Allocated: ${b.allocated}, Used: ${b.used}, Remaining: ${b.remaining}`;
        }).join('\n');

        const systemPrompt = `
        You are the highly sophisticated, official AI Leave & Planning Assistant for the OOO (Out of Office) Portal.
        You have live access to our corporate database.
        Here is the current database context:

        ${userContext}

        <managers_directory>
        ${managerContext || 'No managers registered yet.'}
        </managers_directory>

        <all_employee_leaves>
        ${leaveContext || 'No leaves registered yet.'}
        </all_employee_leaves>

        <holiday_calendar>
        ${holidayContext || 'No holidays registered yet.'}
        </holiday_calendar>

        <your_leave_balances>
        ${balanceContext || 'No balances registered yet.'}
        </your_leave_balances>

        Instructions:
        1. Keep your answers conversational, friendly, professional, and directly relevant.
        2. Use rich markdown formatting (bolding, bullet points, headers) for enhanced readability.
        3. Always check the database context to answer the user's questions perfectly.
        4. If the user asks about department coverage (e.g. "who is on leave from IT"), check the <all_employee_leaves> section and filter by applicant department and approved status.
        5. If the user asks about the next long weekend or planning a holiday, look at the <holiday_calendar> and suggest optimal combinations (e.g., if a holiday is on a Thursday, suggest taking a bridge leave on Friday to get a 4-day weekend).
        6. If the user asks about their own leave status or when their next leave is, check <all_employee_leaves> for their own name and filter their leaves.
        7. If the user asks "who are the managers", list the managers from <managers_directory> with their names and emails.
        8. Answer in natural language, maintaining a highly premium and helpful executive brand.

        User Message: "${message}"
        `;

        const callGemini = (apiKey: string, promptText: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
            const data = JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: promptText
                    }
                  ]
                }
              ]
            });

            const parsedUrl = new URL(url);
            const options = {
              hostname: parsedUrl.hostname,
              path: parsedUrl.pathname + parsedUrl.search,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
              }
            };

            const req = https.request(options, (res) => {
              let body = '';
              res.on('data', (chunk) => body += chunk);
              res.on('end', () => {
                try {
                  const json = JSON.parse(body);
                  const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (reply) {
                    resolve(reply);
                  } else {
                    reject(new Error(body));
                  }
                } catch (err) {
                  reject(err);
                }
              });
            });

            req.on('error', (err) => reject(err));
            req.write(data);
            req.end();
          });
        };

        const geminiReply = await callGemini(geminiKey, systemPrompt);
        return res.json({ reply: geminiReply });
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to local NLP:', geminiError);
      }
    }

    
    let responseMarkdown = '';

    const isPersonalQuery = 
      cleanMsg.includes('my next') || 
      cleanMsg.includes('me next') || 
      cleanMsg.includes('my leave') || 
      cleanMsg.includes('me leave') || 
      cleanMsg.includes('my time') ||
      cleanMsg.includes('taken by me') ||
      cleanMsg.includes('leaves by me') ||
      cleanMsg.includes('my approved') ||
      cleanMsg.includes('my pending') ||
      cleanMsg.includes('scheduled') ||
      (cleanMsg.includes('when') && (cleanMsg.includes('my') || cleanMsg.includes('me'))) ||
      (cleanMsg.includes('what') && cleanMsg.includes('my') && cleanMsg.includes('leave')) ||
      (cleanMsg.includes('show') && cleanMsg.includes('my') && cleanMsg.includes('leave'));

    
    if (isPersonalQuery && !cleanMsg.includes('balance') && !cleanMsg.includes('remaining') && !cleanMsg.includes('quota')) {
      const myLeaves = leaves.filter((l: any) => l.userId === userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activeLeaves = myLeaves.filter((l: any) => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        return l.status === 'approved' && from <= today && to >= today;
      });

      const upcomingApproved = myLeaves.filter((l: any) => {
        const from = new Date(l.fromDate);
        return l.status === 'approved' && from > today;
      });

      const pendingLeaves = myLeaves.filter((l: any) => l.status === 'pending');

      if (myLeaves.length === 0) {
        responseMarkdown = `👤 **Your Personal Leave Schedule:**\n\nYou do not have any active, upcoming, or pending leave requests scheduled in the database. If you need some rest, feel free to submit a new application! ✈️`;
      } else {
        responseMarkdown = `👤 **Your Personal Leave & Absence Schedule:**\n\n`;
        
        if (activeLeaves.length > 0) {
          responseMarkdown += `🏃 **Currently Active Leaves:**\n`;
          activeLeaves.forEach((l: any) => {
            const typeName = l.leaveType ? l.leaveType.name : 'Leave';
            const toDateFormatted = new Date(l.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            responseMarkdown += `* 🌴 **${typeName}** - Active now until **${toDateFormatted}** (Duration: ${l.totalDays} days, Reason: *"${l.reason}"*)\n`;
          });
          responseMarkdown += `\n`;
        }

        if (upcomingApproved.length > 0) {
          responseMarkdown += `📅 **Upcoming Approved Leaves:**\n`;
          upcomingApproved.forEach((l: any) => {
            const typeName = l.leaveType ? l.leaveType.name : 'Leave';
            const fromDateFormatted = new Date(l.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const toDateFormatted = new Date(l.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            responseMarkdown += `* ✅ **${typeName}** - from **${fromDateFormatted}** to **${toDateFormatted}** (${l.totalDays} days, Reason: *"${l.reason}"*)\n`;
          });
          responseMarkdown += `\n`;
        }

        if (pendingLeaves.length > 0) {
          responseMarkdown += `⏳ **Pending Manager Approval:**\n`;
          pendingLeaves.forEach((l: any) => {
            const typeName = l.leaveType ? l.leaveType.name : 'Leave';
            const fromDateFormatted = new Date(l.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const toDateFormatted = new Date(l.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            responseMarkdown += `* ⏳ **${typeName}** - from **${fromDateFormatted}** to **${toDateFormatted}** (${l.totalDays} days, Reason: *"${l.reason}"*)\n`;
          });
          responseMarkdown += `\n`;
        }
        
        responseMarkdown += `💡 *Tip: Need to cancel a leave? Remember that cancellations must be requested at least 3 days prior to the start date!*`;
      }
    }
    
    else if (cleanMsg.includes('balance') || cleanMsg.includes('remaining') || cleanMsg.includes('quota') || cleanMsg.includes('my leave')) {
      if (balances.length === 0) {
        responseMarkdown = `💼 **Your Leave Quota Summary (Year ${currentYear}):**\n\nNo allocated leave balance was found for your account in the system for this year. Please contact HR or your Manager to initialize your allocations. ⚙️`;
      } else {
        responseMarkdown = `💼 **Your Personal Leave Quota Summary (Year ${currentYear}):**\n\nHere is your active leave quota balance:\n\n`;
        let totalRemaining = 0;
        let totalAllocated = 0;

        balances.forEach((bal: any) => {
          const typeName = bal.leaveType ? bal.leaveType.name : 'Other';
          const icon = typeName.toLowerCase().includes('sick') ? '🤒' : typeName.toLowerCase().includes('casual') ? '🌴' : '✈️';
          responseMarkdown += `* ${icon} **${typeName} Leaves**: **${bal.remaining}** days remaining (out of **${bal.allocated}** allocated, **${bal.used}** used)\n`;
          totalRemaining += bal.remaining;
          totalAllocated += bal.allocated;
        });

        responseMarkdown += `\n🌟 *Total Available Balance: **${totalRemaining} Days** (out of ${totalAllocated} allocated).*`;
      }
    } 
    
    else if (cleanMsg.includes('leave') || cleanMsg.includes('absent') || cleanMsg.includes('out today') || cleanMsg.includes('who is on') || cleanMsg.includes('who is out')) {
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));

      
      let filterDept = '';
      if (cleanMsg.includes('it')) filterDept = 'IT';
      else if (cleanMsg.includes('hr')) filterDept = 'HR';
      else if (cleanMsg.includes('sales')) filterDept = 'Sales';
      else if (cleanMsg.includes('finance')) filterDept = 'Finance';
      else if (cleanMsg.includes('operations')) filterDept = 'Operations';
      else if (cleanMsg.includes('engineering')) filterDept = 'Engineering';

      const activeLeaves = leaves.filter((l: any) => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        return l.status === 'approved' && from <= endOfToday && to >= startOfToday;
      });

      
      const matchingLeaves = filterDept
        ? activeLeaves.filter((l: any) => l.applicant && l.applicant.department === filterDept)
        : activeLeaves;

      if (matchingLeaves.length === 0) {
        responseMarkdown = filterDept
          ? `🌴 **Department Coverage Update:**\n\nNo employees from the **${filterDept}** segment are currently out of office today. Everyone is active, fully deployed, and hard at work! 🚀`
          : `🌴 **Company-wide Coverage Update:**\n\nNo employees are currently out of office today. Complete corporate deployment active! 🚀`;
      } else {
        responseMarkdown = filterDept
          ? `🌴 **Active Absences inside the ${filterDept} Department today:**\n\nHere is the active coverage report:\n\n`
          : `🌴 **Active Company-wide Absences today:**\n\nHere is the active coverage report:\n\n`;

        matchingLeaves.forEach((l: any) => {
          const applicantName = `${l.applicant.firstName} ${l.applicant.lastName}`;
          const typeName = l.leaveType ? l.leaveType.name : 'General';
          const toDateFormatted = new Date(l.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          responseMarkdown += `* 👤 **${applicantName}** (${l.applicant.department || 'Unassigned'}) - on *${typeName} Leave* until **${toDateFormatted}** (Reason: *"${l.reason}"*)\n`;
        });
      }
    }
    
    else if (cleanMsg.includes('holiday') || cleanMsg.includes('weekend') || cleanMsg.includes('long') || cleanMsg.includes('plan')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingHolidays = holidays.filter((h: any) => new Date(h.date) >= today);

      if (upcomingHolidays.length === 0) {
        responseMarkdown = `📅 **Holiday & Long Weekend Planner:**\n\nThere are no upcoming holidays registered in the portal database for the rest of the year. Please contact HR to load the holiday calendar. ⚙️`;
      } else {
        responseMarkdown = `📅 **Corporate Holiday & Long Weekend Planner:**\n\nHere are your upcoming holidays and optimized long-weekend strategies to maximize your rest:\n\n`;

        upcomingHolidays.forEach((h: any) => {
          const hDate = new Date(h.date);
          const dayName = hDate.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = hDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          responseMarkdown += `* 🎉 **${h.name}** - **${formattedDate}** (${dayName})\n`;

          
          if (dayName === 'Friday') {
            responseMarkdown += `  ✨ *Long Weekend!* No action needed—enjoy an automatic 3-day weekend (Fri-Sun)!\n`;
          } else if (dayName === 'Monday') {
            responseMarkdown += `  ✨ *Long Weekend!* No action needed—enjoy an automatic 3-day weekend (Sat-Mon)!\n`;
          } else if (dayName === 'Thursday') {
            responseMarkdown += `  💡 *Bridge Hack:* Take a leave on **Friday** to unlock a **4-day holiday weekend** (Thu-Sun)!\n`;
          } else if (dayName === 'Tuesday') {
            responseMarkdown += `  💡 *Bridge Hack:* Take a leave on **Monday** to unlock a **4-day holiday weekend** (Sat-Tue)!\n`;
          }
        });

        responseMarkdown += `\n✈️ *Pro-Tip: Check your balances by asking me 'What is my remaining balance?' before planning your trip!*`;
      }
    }
    
    else if (cleanMsg.includes('manager') || cleanMsg.includes('managers') || cleanMsg.includes('who is the manager')) {
      if (managers.length === 0) {
        responseMarkdown = `👑 **Company Managers Directory:**\n\nThere are no designated managers registered in the database. ⚙️`;
      } else {
        responseMarkdown = `👑 **Company Managers Directory:**\n\nHere are all the managers currently registered in our database segments:\n\n`;
        managers.forEach((m: any) => {
          responseMarkdown += `* 👤 **${m.firstName} ${m.lastName}** - Department: **${m.department || 'Unassigned'}** (Email: *${m.email}*)\n`;
        });
        responseMarkdown += `\n💡 *Note: Managers have structural control over employee leave allocations and approvals within their assigned departments.*`;
      }
    }
    
    else {
      const firstName = currentUser?.firstName || 'User';
      responseMarkdown = `👋 **Hello ${firstName}! I am your instant AI Leave & Planner Assistant.**\n\nI have live query access to our company database and can help you answer these instantly:\n\n1. 🌴 **Coverage Tracking**: Ask me *'Who is out today?'* or *'Who is on leave from the IT team?'*\n2. 📅 **Long Weekend Planning**: Ask me *'Plan my next long weekend'* or *'Show upcoming holidays'* \n3. 💼 **Personal Quotas**: Ask me *'What is my remaining leave balance?'*\n\nHow can I help you plan or check schedules today?`;
    }

    res.json({ reply: responseMarkdown });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      message: error.message || 'AI assistant failed to answer your query',
      stack: error.stack 
    });
  }
};

export const deleteLeave = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.userId !== req.user.id && !['manager', 'hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel a leave request that is not pending' });
    }
    
    leave.status = 'cancelled';
    await leave.save();
    res.json({ message: 'Leave request cancelled successfully', leave });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to cancel leave' });
  }
};

export const getMyBalances = async (req: AuthRequest, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const balances = await LeaveBalance.findAll({
      where: { userId: req.user.id, year: currentYear },
      include: [{ model: LeaveType, as: 'leaveType' }]
    });
    res.json(balances);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch leave balances' });
  }
};