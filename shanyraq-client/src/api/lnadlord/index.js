import api from "../axios"
export class LandLordApi {
    static async getLandlord(landlordId) {
        try {
            const data = await api.get(`/Landlord/${landlordId}`)
            return data
        }
        catch (e) {
            throw e
        }
    }
    static async getReview(landlordId, {page = '1'}) {
        try {
            const data = api.get(`/review/Tenant/landlord/${landlordId}?page=${page}`)
            return data
        }
        catch (e) {
            throw e
        }
    }
}
