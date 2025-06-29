import { create } from "zustand";
import { HouseApi } from "../../api/house";

const useHouseReviewsStore = create((set) => ({
    reviews: null,
    pageTotal: 0,
    reviewLoading: false,
    getReviews: async (houseId, { page = '1' }) => {
        try {
            set({ reviewLoading: true })
            const data = await HouseApi.getReviews(houseId, { page })
            set({ reviews: data.data.reviews })
            set({ pageTotal: data.data.totalPage })
            set({ reviewLoading: false })
        }
        catch (e) {
            
        }
    }
}))

export default useHouseReviewsStore