import { create } from "zustand";
import { LandLordApi } from "../../api/lnadlord";

const useLandlordStore = create(set => ({
    landlord: null,
    reviews: [],
    reviewsTotalPage: 0,
    isReviewsLoading: false,
    getLandlord: async (landlordId) => {
        const data = await LandLordApi.getLandlord(landlordId)
        set({ landlord: data.data.landlord })
    },
    getReviews: async (landlordId, { page = '1' }) => {
        set({isReviewsLoading: true})
        const data = await LandLordApi.getReview(landlordId, { page })
        set({ reviews: data.data.reviews })
        set({ reviewsTotalPage: data.data.totalPage })
        set({ isReviewsLoading: false })

    }




}))

export default useLandlordStore