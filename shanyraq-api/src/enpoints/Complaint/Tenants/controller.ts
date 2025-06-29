import { Request, Response } from "express"
import { tenantRequest } from "../../Tenants/jwt"
import { ComplaintTenant } from "../../../DB/Schems/Tenants/ComplaintTenant"

class TComplaints {
    public async createForHouse(req: tenantRequest, res: Response): Promise<void> {
        try {
            const { houseId } = req.params
            const {  
                complaintFor = 'Другое',
                comment
            } = req.body

            await ComplaintTenant.create({
                complaintType: 'house',
                objectId: houseId,
                TenantsId: req.tenantId,
                complaintFor: complaintFor,
                comment: comment
            })

            res.json({message: 'ваша жалоба добавлена'})
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async createForLandlords(req: tenantRequest, res: Response): Promise<void> {
        try {
            const { landlordId } = req.params
            const {  
                complaintFor = 'Другое',
                comment
            } = req.body

            await ComplaintTenant.create({
                complaintType: 'landlords',
                objectId: landlordId,
                TenantsId: req.tenantId,
                complaintFor: complaintFor,
                comment: comment
            })

            res.json({message: 'ваша жалоба добавлена'})
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async getHouse(req: Request, res: Response): Promise<void> {
        try {
            const { 
                page = '1',
                complaintFor = ''
            } = req.query

            
            const pageNum = parseInt(page as string)

            if (isNaN(pageNum) || pageNum < 1) {
                res.status(400).json({ message: 'Некорректный номер страницы' });
                return;
            }
            if (complaintFor) {

                const complaints = (await ComplaintTenant.find({
                    complaintType: 'house',
                    complaintFor: { $gte: complaintFor } 
                }).skip((pageNum-1) * 100).limit(100)).map((complaint) => ({
                    tenantsId: complaint.objectId,
                    commet: complaint.comment
                }))
                
                
                res.json({
                    complaints
                })
                return
            }
            const complaints = (await ComplaintTenant.find({
                complaintType: 'house',
            }).skip((pageNum-1) * 100).limit(100)).map((complaint) => ({
                tenantsId: complaint.objectId,
                commet: complaint.comment
            }))
            
            
            res.json({
                complaints
            })
            return

        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async getLandlord(req:Request, res:Response): Promise<void> {
        try {
            const { 
                page = '1',
                complaintFor = ''
            } = req.query

            
            const pageNum = parseInt(page as string)

            if (isNaN(pageNum) || pageNum < 1) {
                res.status(400).json({ message: 'Некорректный номер страницы' });
                return;
            }
            if (complaintFor) {

                const complaints = (await ComplaintTenant.find({
                    complaintType: 'landlords',
                    complaintFor: { $gte: complaintFor } 
                }).skip((pageNum-1) * 100).limit(100)).map((complaint) => ({
                    tenantsId: complaint.objectId,
                    commet: complaint.comment
                }))
                
                
                res.json({
                    complaints
                })
                return
            }

            const complaints = (await ComplaintTenant.find({
                complaintType: 'landlords',
            }).skip((pageNum-1) * 100).limit(100)).map((complaint) => ({
                tenantsId: complaint.objectId,
                commet: complaint.comment
            }))
            
            
            res.json({
                complaints
            })
            return
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async deleteComplaint(req: tenantRequest, res: Response): Promise<void> {
        try {
            const { complaintId } = req.query

            const complaint = await ComplaintTenant.findById(complaintId)

            if (complaint?.tenantId !== req.tenantId) {
                res.status(401).json({message: 'у вас нет доступа'})
                return
            }

            if (!complaint) {
                res.status(404).json({message: 'жалоба не найдена'})
                return
            }

            ComplaintTenant.findByIdAndDelete(complaintId)

            res.json({message: 'данная жалоба удалена успешно'})
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async updateReview(req:tenantRequest, res:Response): Promise<void> {
        try {
            const { complaintId } = req.params
            const {  
                comment = ''
            } = req.body

            const complaint = await ComplaintTenant.findById(complaintId)

            if (!complaint) {
                res.status(404).json({message: 'жалоба не найдена'})
                return
            }

            complaint.comment = comment ?? complaint.comment

            complaint.save()

            res.json({message: 'данные обнавлены'})

            
            
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }
}

export default new TComplaints()