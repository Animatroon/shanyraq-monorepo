import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './one-house.scss'
import useHouseStore from '../../../store/House/houseStore';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import StarRating from '../../../components/UI/Star-rating/StarRating'
import ReviewForm from '../../../components/UI/review-form/ReviewForm';
import NotFound from '../../notfound/NotFound'
import Loading  from '../../Loading/loading'
// import { REACT_APP_API_URL } from '../../../config/env';
// import { Reviews } from '../../../components/reviews/Reviews';
// import { ReviewCard } from '../../../components/review-card/ReviewCard';


export default function OneHouse() {
    const galleryRef = useRef(null);
    const navigate = useNavigate()
    const { getHouse, house, notFound } = useHouseStore()
    const { houseId } = useParams()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getHouse(houseId).finally(() => setLoading(false))
    }, [houseId])


    if (notFound) {
        return <NotFound/>
    }

    const scroll = (direction) => {
        const gallery = galleryRef.current;
        if (!gallery) return;
        const scrollAmount = gallery.offsetWidth + 16;
        gallery.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    };

    if (loading) return <Loading/>

    return (
        <section className='houseContiner'>
            <button className='back-button' onClick={() => navigate(-1)}>← Назад ко всем квартирам</button>

            <div className='houseContiner-block up'>
                <div className='images-block'>
                    <button className='button-LR' onClick={() => scroll('left')}><FaChevronLeft /></button>
                    <div className='images' ref={galleryRef}>
                        {house?.images?.length
                            ? house.images.map(img => (
                                <img key={img} src={`http://localhost:4000${img}`} className="house-image" alt="loading..." />
                            ))
                            : <p>Изображения отсутствуют</p>
                        }
                    </div>
                    <button className='button-LR' onClick={() => scroll('right')}><FaChevronRight /></button>
                </div>

                <div className='info'>
                    <h1 className='house-type'>{house.type}</h1>
                    <div className='info-atribut'><h1>цена:</h1><h1>{house.price} тг</h1></div>
                    <div className='info-atribut'><h4>город:</h4><h4>{house.city}</h4></div>
                    <div className='info-atribut'><h4>адрес:</h4><h4>{house.adress}</h4></div>
                    <div className='info-atribut'><h4>комнат:</h4><h4>{house.roomCount}</h4></div>
                    <div className='info-atribut'><h4>этаж:</h4><h4>{house.floor}</h4></div>
                    <div className='info-atribut'><h4>площадь:</h4><h4>{house.meterSquare} м²</h4></div>
                </div>
            </div>

            <div className='description'>
                <h2>Описание:</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{house.description}</p>
            </div>

            <Link to={`/landlord/${house.author.authorId}`} className='houseContiner-block author'>
                <div className='author-main'>
                    <div className="avatar-circle"></div>
                    <h1 className='author-name'>{house.author.landlordNmae}</h1>
                </div>
                <div className='author-rating'>
                    <hr style={{ marginRight: '10px' }} />
                    <h1 className='author-star'><StarRating rating={house.author.avgRating || 0} /> {house.author.avgRating || 0}</h1>
                </div>
            </Link>

            <div className='houseContiner-block down'>
                <div className='review-title'>
                    <h1>Отзывы:</h1>
                    <div className='review-title-right'>
                        <hr style={{ marginRight: '10px' }} />
                        <h1><StarRating rating={house.avgRating || 0} /> {house.avgRating || 0}</h1>
                    </div>
                </div>
                <hr style={{ marginTop: '10px' }} />

                {house.reviews.length !== 0 ? (
                    <div className='reviews'>
                        {house.reviews.map((review, i) => (
                            // <ReviewCard review={review} />
                            <div className='review' key={i}>
                                {/* <div className="avatar-circle small" /> */}
                                <h4><StarRating rating={review.rating} /> {review.rating} <br/>{review.comment}</h4>
                                
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='reviews-not-faund'>
                        <h3>Отзывы не найдены :(</h3>
                    </div>
                )}

                <div className='more-reviews-block'>
                    <Link to={`/house/review/${houseId}`}><button className='more-reviews'>Больше</button></Link>
                </div>

                <ReviewForm houseId={houseId} />
            </div>
        </section>
    )
}
