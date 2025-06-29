import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';


export default function StarRating({ rating }) {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        if (i < rating) {
            if (rating < i+1) {
                stars.push(<FaStarHalfAlt key={i} />)
            } 
            else stars.push(<FaStar key={i} />);
        }
        else  {
            stars.push(<FaRegStar key={i} />);
        }
    }

    return <span className="stars-rating">{stars}</span>;
}
  