import { Request, Response } from "express"
import { landlordRequest } from "../../Landlords/jwt"
import { ReviewLandlord } from "../../../DB/Schems/Landlords/reviewLandlord"
import { ComplaintLandlord, ComplaintType } from "../../../DB/Schems/Landlords/ComplaintLandlord"

class LComplaint{
    public async create(req: landlordRequest, res: Response): Promise<void> {
        try {
            try {
                const { tenantsId } = req.params
                const {  
                    complaintFor = ComplaintType.OTHER,
                    comment
                } = req.body
    
                await ComplaintLandlord.create({
                    tenantsId: tenantsId,
                    landlordId: req.landlordId,
                    complaintFor: complaintFor,
                    comment: comment
                })
    
                res.json({message: 'ваша жалоба добавлена'})
            }
            catch (e) {
                res.status(500).json({message: 'ошибка сервера'})
            }

        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    } 

    public async get(req: Request, res: Response): Promise<void> {
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

                const reviews = (await ReviewLandlord.find({
                    rating: { $gte: complaintFor } 
                }).skip((pageNum-1) * 100).limit(100)).map((review) => ({
                    landlordId: review.landlordId,
                    rating: review.rating,
                    commet: review.comment
                }))
                res.json({
                    reviews
                })
                return
            }


            const reviews = (await ReviewLandlord.find({
            }).skip((pageNum-1) * 100).limit(100)).map((review) => ({
                landlordId: review.landlordId,
                rating: review.rating,
                commet: review.comment
            }))
            res.json({
                reviews
            })
            return



        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async delete(req: landlordRequest, res: Response): Promise<void> {
        try {
            const { complaintId } = req.params

            const complaint = await ReviewLandlord.findById(complaintId)

            if (complaint?.landlordId !== req.landlordId) {
                res.status(401).json({message: 'у вас нет доступа'})
                return
            }

            if (!complaint) {
                res.status(404).json({message: 'отзыв не найден'})
                return
            }

            await ReviewLandlord.findByIdAndDelete(complaint)


            res.json({message: 'данны отзыв удален успешно'})
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async update(req: landlordRequest, res: Response): Promise<void> {
        try {
            const { complaintId } = req.params
            const {  
                rating = '',
                comment = ''
            } = req.body

            const complaint = await ReviewLandlord.findById(complaintId)

            if (!complaint) {
                res.status(404).json({message: 'отзыв не найден'})
                return
            }

            complaint.rating = rating ?? complaint.rating
            complaint.comment = comment ?? complaint.comment

            complaint.save()

            res.json({message: 'данные обнавлены'})

            
            
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }
}

export default new LComplaint()