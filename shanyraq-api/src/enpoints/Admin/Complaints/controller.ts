// src/enpoints/Admin/Complaints/controller.ts
import mongoose from "mongoose";
import { Response } from "express";
import { bindMethods } from "../../../BindMethonds";
import { adminRequest } from "../jwt";
import { StatusType as ComplaintStatusType } from "../../../DB/Schems/Tenants/ComplaintTenant"; 
import { ComplaintLandlord } from "../../../DB/Schems/Landlords/ComplaintLandlord";
import { Landlord } from "../../../DB/Schems/Landlords/landlord";
import { ComplaintTenant } from "../../../DB/Schems/Tenants/ComplaintTenant";
import { Tenant } from "../../../DB/Schems/Tenants/tenant";

class ComplaintController {
    constructor() {
        bindMethods(this);
    }

    public async getTenants(req: adminRequest, res: Response): Promise<void> { 
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as string;
            const skip = (page - 1) * limit;

            const query: mongoose.FilterQuery<typeof ComplaintTenant.schema.obj> = {}; // Используем типизацию Mongoose
            if (status && status !== 'all' && Object.values(ComplaintStatusType).includes(status as ComplaintStatusType)) {
                query.status = status as ComplaintStatusType;
            }

            const totalComplaints = await ComplaintTenant.countDocuments(query);
            const complaints = await ComplaintTenant.find(query)
                                     .sort({ createdAt: -1 })
                                     .skip(skip)
                                     .limit(limit)
                                     .lean(); // Используем lean для производительности

            const results = await Promise.all(complaints.map(async (complaint) => {
                const author = await Tenant.findById(complaint.tenantId).select('firstName lastName fatherName email').lean();
                return {
                    _id: complaint._id,
                    author: author ? `${author.firstName || ''} ${author.lastName || ''} ${author.fatherName || ''}`.trim() : 'Неизвестный автор',
                    authorId: complaint.tenantId,
                    authorEmail: author?.email,
                    complaintType: complaint.complaintType,
                    objectId: complaint.objectId,
                    comment: complaint.comment,
                    status: complaint.status,
                    createdAt: complaint.createdAt,
                };
            }));

            res.json({ complaints: results, currentPage: page, totalPages: Math.ceil(totalComplaints / limit), totalComplaints });
        } catch (error) {
            console.error("Get Tenant Complaints Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении жалоб арендаторов';
            res.status(500).json({ message });
        }
    }

    public async getLandlords(req: adminRequest, res: Response): Promise<void> { // Возвращаем Promise<void>
        try {
             const page = parseInt(req.query.page as string) || 1;
             const limit = parseInt(req.query.limit as string) || 20;
             const status = req.query.status as string;
             const skip = (page - 1) * limit;

             const query: mongoose.FilterQuery<typeof ComplaintLandlord.schema.obj> = {}; // Используем типизацию Mongoose
             if (status && status !== 'all' && Object.values(ComplaintStatusType).includes(status as ComplaintStatusType)) {
                 query.status = status as ComplaintStatusType;
             }

            const totalComplaints = await ComplaintLandlord.countDocuments(query);
            const complaints = await ComplaintLandlord.find(query)
                                     .sort({ createdAt: -1 })
                                     .skip(skip)
                                     .limit(limit)
                                     .lean();

            const results = await Promise.all(complaints.map(async (complaint) => {
                const author = await Landlord.findById(complaint.landlordId).select('firstName lastName fatherName email').lean();
                const tenant = complaint.tenantsId ? await Tenant.findById(complaint.tenantsId).select('firstName lastName fatherName email').lean() : null;
                return {
                    _id: complaint._id,
                    author: author ? `${author.firstName || ''} ${author.lastName || ''} ${author.fatherName || ''}`.trim() : 'Неизвестный автор',
                    authorId: complaint.landlordId,
                    authorEmail: author?.email,
                    targetTenantId: complaint.tenantsId,
                    targetTenantInfo: tenant ? `${tenant.firstName || ''} ${tenant.lastName || ''} (${tenant.email || ''})`.trim() : 'Арендатор не найден',
                    comment: complaint.comment,
                    status: complaint.status,
                    complaintFor: complaint.complaintFor,
                    createdAt: complaint.createdAt,
                };
            }));

            res.json({ complaints: results, currentPage: page, totalPages: Math.ceil(totalComplaints / limit), totalComplaints });
        } catch (error) {
            console.error("Get Landlord Complaints Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при получении жалоб арендодателей';
            res.status(500).json({ message });
        }
    }

    public async setStatusTenantComplaint(req: adminRequest, res: Response): Promise<void> { // Возвращаем Promise<void>
        try {
            const complaintId = req.params.complaintId;
            const { status } = req.body;

            if (!mongoose.Types.ObjectId.isValid(complaintId)) {
                 res.status(400).json({ message: 'Невалидный ID жалобы' });
                 return; // Просто выходим, не возвращая res
            }

            if (!status || !Object.values(ComplaintStatusType).includes(status as ComplaintStatusType)) {
                  res.status(400).json({ message: `Неверный статус. Допустимые значения: ${Object.values(ComplaintStatusType).join(', ')}` });
                  return;
            }
            // Сверяем с начальным статусом (у тебя это 'active')
            if (status === ComplaintStatusType.ACTIVE) {
                 res.status(400).json({ message: `Статус ${ComplaintStatusType.ACTIVE} устанавливается автоматически` });
                 return;
            }

            const complaint = await ComplaintTenant.findById(complaintId);
            if (!complaint){
                res.status(404).json({ message: 'Жалоба не найдена' });
                return;
            }

            complaint.status = status as ComplaintStatusType;
            await complaint.save();
            res.json({ message: 'Статус жалобы обновлен', complaint }); // Отправляем ответ
        } catch (error) {
            console.error("Set Tenant Complaint Status Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при обновлении статуса жалобы';
            res.status(500).json({ message });
        }
    }

     public async setStatusLandlordComplaint(req: adminRequest, res: Response): Promise<void> { // Возвращаем Promise<void>
         try {
            const complaintId = req.params.complaintId;
            const { status } = req.body;

             if (!mongoose.Types.ObjectId.isValid(complaintId)){
                res.status(400).json({ message: 'Невалидный ID жалобы' });
                return;
            }

             if (!status || !Object.values(ComplaintStatusType).includes(status as ComplaintStatusType)) {
                   res.status(400).json({ message: `Неверный статус. Допустимые значения: ${Object.values(ComplaintStatusType).join(', ')}` });
                   return;
             }
              if (status === ComplaintStatusType.ACTIVE) {
                   res.status(400).json({ message: `Статус ${ComplaintStatusType.ACTIVE} устанавливается автоматически` });
                   return;
              }

            const complaint = await ComplaintLandlord.findById(complaintId);
            if (!complaint){
                res.status(404).json({ message: 'Жалоба не найдена' });
                return;
            }

            complaint.status = status as ComplaintStatusType;
            await complaint.save();
            res.json({ message: 'Статус жалобы обновлен', complaint }); // Отправляем ответ
        } catch (error) {
            console.error("Set Landlord Complaint Status Error:", error);
            const message = error instanceof Error ? error.message : 'Ошибка сервера при обновлении статуса жалобы';
            res.status(500).json({ message });
        }
    }
}


const complaintControllerInstance = new ComplaintController();
export default complaintControllerInstance;