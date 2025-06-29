import { useEffect } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import useLandlordStore from "../../../store/landlord/landlordStore"
import ava from '../../../assets/images/def_ava.jpg'
import './one-landlord.scss'
import StarRating from "../../../components/UI/Star-rating/StarRating"
import Lodaing from "../../Loading/loading"
import { ReviewCard } from "../../../components/review-card/ReviewCard"
import Button from '../../../components/UI/button/Button' 
import { Pagination } from "../../../components/pagination/Pagination"
export default function OneLandlord() {
    const { landlordId } = useParams()
    const { landlord, getLandlord, getReviews, reviews, reviewsTotalPage, isReviewsLoading } = useLandlordStore()
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1');
    useEffect(() => {
        try {
            const reviewParams = {
                page
            }
            getLandlord(landlordId)
            getReviews(landlordId, reviewParams)
        }
        catch {
            
        }
    }, [landlordId, page])

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };
    return (
        <>
            {   landlord ?

                <div className="landlord-continer">

                    <div className="landlord">
                        <div className="ava">
                            <img src={ava} alt="" />
                        </div>
                        <div className="data">
                            <div className="user-name">
                                <h1>{landlord.firstName+' '+landlord.lastName+' '+landlord.fatherName}</h1>
                                <h2><StarRating rating={landlord.averageRating} /> {landlord.averageRating}</h2>
                            </div>
                            <div className="info-data">
                                <p>почта: {landlord.email}</p>
                                <p>телефон: {landlord.phone}</p>
                                <p>ИИН: {landlord.IIN}</p>
                                <p>дата регистраций: {landlord.createAt}</p>
                            </div>
                        </div>


                    </div> 
                
                    <div className="reviews" >
                        {
                            reviews && !isReviewsLoading ? 
                            reviews.map((review, index) => 
                                (<ReviewCard review={review} key={index}/>)
                            ) :
                            <Lodaing/>
                            
                        }
                        <Pagination page={page} totalPage={reviewsTotalPage} handlePageChange={handlePageChange} />

                    </div>
                </div> : <Lodaing/>
            }
        
        
        
        </>
    )
}