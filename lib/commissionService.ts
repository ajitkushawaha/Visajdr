import connectDB from './db';
import AgentCommission from '@/models/AgentCommission';
import Agent from '@/models/Agent';

interface CommissionData {
  agentId: string;
  applicationId: string;
  sourceType: 'visa_application' | 'travel_insurance' | 'other';
  sourceId: string;
  baseAmount: number;
  commissionRate?: number;
  commissionType?: 'percentage' | 'fixed';
}

export class CommissionService {
  private static instance: CommissionService;

  public static getInstance(): CommissionService {
    if (!CommissionService.instance) {
      CommissionService.instance = new CommissionService();
    }
    return CommissionService.instance;
  }

  async createCommission(data: CommissionData): Promise<boolean> {
    try {
      await connectDB();

      // Get agent details to determine commission rate
      const agent = await Agent.findById(data.agentId);
      if (!agent) {
        console.error('Agent not found for commission creation');
        return false;
      }

      // Use provided rate or agent's default rate
      const commissionRate = data.commissionRate || agent.commissionRate || 5; // Default 5%
      const commissionType = data.commissionType || agent.commissionType || 'percentage';

      // Calculate commission amount
      let commissionAmount: number;
      if (commissionType === 'percentage') {
        commissionAmount = (data.baseAmount * commissionRate) / 100;
      } else {
        commissionAmount = commissionRate;
      }

      // Generate payment period (current month)
      const now = new Date();
      const paymentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Create commission record
      const commission = new AgentCommission({
        agentId: data.agentId,
        applicationId: data.applicationId,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        commissionAmount,
        commissionRate,
        commissionType,
        baseAmount: data.baseAmount,
        status: 'pending',
        paymentPeriod
      });

      await commission.save();
      console.log(`Commission created: ${commissionAmount} for agent ${data.agentId}`);
      return true;

    } catch (error) {
      console.error('Error creating commission:', error);
      return false;
    }
  }

  async processApplicationApproval(applicationId: string, agentId: string, totalAmount: number): Promise<boolean> {
    try {
      // Check if commission already exists for this application
      const existingCommission = await AgentCommission.findOne({
        applicationId,
        agentId
      });

      if (existingCommission) {
        console.log('Commission already exists for this application');
        return true;
      }

      // Create commission for approved application
      return await this.createCommission({
        agentId,
        applicationId,
        sourceType: 'visa_application',
        sourceId: applicationId,
        baseAmount: totalAmount
      });

    } catch (error) {
      console.error('Error processing application approval commission:', error);
      return false;
    }
  }

  async getAgentCommissions(agentId: string, filters: any = {}): Promise<any[]> {
    try {
      await connectDB();

      const query: any = { agentId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.paymentPeriod) {
        query.paymentPeriod = filters.paymentPeriod;
      }

      const commissions = await AgentCommission.find(query)
        .populate('applicationId', 'trackingId personalInfo visaDetails')
        .sort({ createdAt: -1 })
        .lean();

      return commissions;

    } catch (error) {
      console.error('Error fetching agent commissions:', error);
      return [];
    }
  }

  async getCommissionStats(agentId: string): Promise<any> {
    try {
      await connectDB();

      const stats = await AgentCommission.aggregate([
        { $match: { agentId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$commissionAmount" }
          }
        }
      ]);

      const totalCommissions = await AgentCommission.countDocuments({ agentId });
      const totalEarnings = await AgentCommission.aggregate([
        { $match: { agentId } },
        { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
      ]);

      const result = {
        totalCommissions,
        pendingCommissions: 0,
        paidCommissions: 0,
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingEarnings: 0,
        paidEarnings: 0
      };

      stats.forEach(stat => {
        switch (stat._id) {
          case 'pending':
            result.pendingCommissions = stat.count;
            result.pendingEarnings = stat.totalAmount;
            break;
          case 'paid':
            result.paidCommissions = stat.count;
            result.paidEarnings = stat.totalAmount;
            break;
        }
      });

      return result;

    } catch (error) {
      console.error('Error fetching commission stats:', error);
      return {
        totalCommissions: 0,
        pendingCommissions: 0,
        paidCommissions: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0
      };
    }
  }
}

export const commissionService = CommissionService.getInstance();