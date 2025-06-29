import { Request, Response } from "express"
import { landlordRequest } from "../../Landlords/jwt"
import { ReviewLandlord } from "../../../DB/Schems/Landlords/reviewLandlord"

class LReview {
    public async create(req: landlordRequest, res: Response): Promise<void> {
        try {
            try {
                const { tenantId } = req.params
                const {  
                    rating,
                    comment
                } = req.body
    
                await ReviewLandlord.create({
                    tenantId: tenantId,
                    landlordId: req.landlordId,
                    rating: rating,
                    comment: comment
                })
    
                res.json({message: 'ваш отзыв добавлен'})
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
                rating = '0'
            } = req.query

            
            const pageNum = parseInt(page as string)
            const ratingNum = parseInt(rating as string)

            if (isNaN(pageNum) || pageNum < 1) {
                res.status(400).json({ message: 'Некорректный номер страницы' });
                return;
            }
        
            if (isNaN(ratingNum) || ratingNum < 0) {
                res.status(400).json({ message: 'Некорректный рейтинг' });
                return;
            }

            const reviews = (await ReviewLandlord.find({
                rating: { $gte: ratingNum } 
            }).skip((pageNum-1) * 100).limit(100)).map((review) => ({
                landlordId: review.landlordId,
                rating: review.rating,
                commet: review.comment
            }))

            res.json({
                reviews
            })

        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async delete(req: landlordRequest, res: Response): Promise<void> {
        try {
            const { reviewId } = req.params

            const review = await ReviewLandlord.findById(reviewId)

            if (review?.landlordId !== req.landlordId) {
                res.status(401).json({message: 'у вас нет доступа'})
                return
            }

            if (!review) {
                res.status(404).json({message: 'отзыв не найден'})
                return
            }

            await ReviewLandlord.findByIdAndDelete(reviewId)


            res.json({message: 'данны отзыв удален успешно'})
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }

    public async update(req: landlordRequest, res: Response): Promise<void> {
        try {
            const { reviewId } = req.params
            const {  
                rating = 0,
                comment = ''
            } = req.body

            const review = await ReviewLandlord.findById(reviewId)

            if (!review) {
                res.status(404).json({message: 'отзыв не найден'})
                return
            }

            review.rating = rating ?? review.rating
            review.comment = comment ?? review.comment

            review.save()

            res.json({message: 'данные обнавлены'})

            
            
        }
        catch (e) {
            res.status(500).json({message: 'ошибка сервера'})
        }
    }
}

export default new LReview()