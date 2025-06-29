import './review-card.scss'
import StarRating from '../UI/Star-rating/StarRating'

export const ReviewCard = ({review}) => {
    return (
        <>
            <div>
                <div className='review'>
                    {/* <div className="avatar-circle small" /> */}
                    <h4><StarRating rating={review.rating} /> {review.rating}</h4>
                    {review.commet}
                </div>
            </div>
        </>
    )
}