import { useParams, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import useHouseReviewsSrtore from "../../../store/House/houseReviewsStore";
import './reviews.scss'
import StarRating from "../../../components/UI/Star-rating/StarRating";
import useHouseStore from "../../../store/House/houseStore";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Lodaing from "../../Loading/loading";
import { ReviewCard } from "../../../components/review-card/ReviewCard";
import { Pagination } from "../../../components/pagination/Pagination";
import Loading from '../../Loading/loading'



export default function HouseReviews() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { reviews, getReviews, pageTotal, reviewLoading } = useHouseReviewsSrtore()
    const { house, getHouse } = useHouseStore()
    const { houseId } = useParams()
    const galleryRef = useRef(null);
    const page = parseInt(searchParams.get('page') || '1');
    useEffect(() => {
        try {
            const reviewParams = {
                page
            }

            getReviews(houseId, reviewParams)
            getHouse(houseId)
        }
        catch {
            
        }
    },[houseId, page])
    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };
    const scroll = (direction) => {
        const gallery = galleryRef.current;
        if (!gallery) return;

        const scrollAmount = gallery.offsetWidth + 16;

        if (direction === 'left') {

            gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };
    // console.log(reviews)
    return (
        <>
            <div className="main-reviews">
                {
                    house ?
                    <div className="main-reviews house-small-info" >
                        <div className='images-block' >

                            <button className='button-LR' onClick={() => scroll('left')} ><FaChevronLeft/></button>
                                <div className='images' ref={galleryRef}>
                                {
                                    house.images ? house.images.map(img => (
                                        <img key={img} src={`http://localhost:4000${img}`} className="house-image" alt="loading..." />
                                    )) : (
                                        <p>Изображения отсутствуют</p>
                                    )
                                }
                                </div>
                            <button className='button-LR' onClick={() => scroll('right')}><FaChevronRight/></button>
                        </div>
                        <div className="house-info">
                            <h1>{house.price} тг {house.rentals === 'monthly' ? 'за месяц' : house.rentals === 'daily' ? 'за день' : 'за час'} </h1> 
                            <p> описание:</p> <p>{house.description}</p>
                            <h2> <StarRating rating={house.avgRating} /> {house.avgRating} </h2>
                        </div>
                    </div> :
                    <Lodaing/>
                }


                <div className="main-reviews reviews" >
                    { reviews && !reviewLoading ?
                        reviews.map((review, index) => 
                            (<ReviewCard review={review} key={index} />)
                        ) : <Loading/>
                    }
                    <Pagination page={page} handlePageChange={handlePageChange} totalPage={pageTotal} />
                </div>
            </div>
        </>
    )
}