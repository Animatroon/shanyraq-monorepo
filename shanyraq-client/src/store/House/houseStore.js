import { create } from "zustand";
import { HouseApi } from "../../api/house";
import NotFound from "../../pages/notfound/NotFound";

const useHouseStore = create((set) => ({
  house: null,
  houses: [],
  loading: false,
  notFound: false,
  filters: {},
  sort: '',

  getHouse: async (houseId) => {
    try {
      const data = await HouseApi.getHouse(houseId);
      set({ house: data.data.house });
    } catch (e) {
      set({ notFound: true })
      console.error('Ошибка при получении одного дома:', e);
      // throw e;
    }
  },

  getHouses: async (filters = {}, sort = '') => {
    set({ loading: true });

    const params = { ...filters };

    if (sort === 'price-asc') params.sort = 'price';
    else if (sort === 'price-desc') params.sort = '-price';
    else if (sort === 'rating-desc') params.sort = '-avgRating';
    else if (sort === 'date-desc') params.sort = '-createdAt';

    try {
      const { data } = await HouseApi.getHouses(params);
      console.log('Ответ от backend:', data.houses);
      set({ houses: data.houses, loading: false });
    } catch (e) {
      console.error('Ошибка загрузки домов:', e);
      set({ loading: false });
    }
  },

  createHouse: async (formData) => {
    try {
      await HouseApi.createHouse(formData);
    } catch (e) {
      throw e;
    }
  },

  toggleFavorite: (() => {
    let timer = null;

    return async (houseId) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          await HouseApi.toggleFavorite(houseId);
          set((state) => ({
            houses: state.houses.map((h) =>
              h.houseId === houseId ? { ...h, isFavorite: !h.isFavorite } : h
            ),
          }));
        } catch (e) {
          console.error('Ошибка toggleFavorite:', e);
        }
      }, 500);
    };
  })(),
  
}));

export default useHouseStore;
