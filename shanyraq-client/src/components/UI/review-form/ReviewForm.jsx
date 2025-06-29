import { useState } from 'react'
import StarRating from '../Star-rating/StarRating'

import './review-form.scss';

export default function ReviewForm({ houseId }) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating || !comment.trim()) return

        console.log({ rating, comment, houseId })
        setRating(0)
        setComment('')
    }

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>Оставить отзыв:</h3>
            <StarRating rating={rating} setRating={setRating} step={0.5} />
            <textarea
                placeholder="Ваш отзыв (анонимно)"
                value={comment}
                onChange={e => setComment(e.target.value)}
            />
            <button type="submit">Отправить</button>
        </form>
    )
}
