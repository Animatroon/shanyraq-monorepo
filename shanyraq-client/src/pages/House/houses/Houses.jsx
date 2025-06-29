import React, { useEffect, useState } from 'react';
import useHouseStore from '../../../store/House/houseStore';
import HouseCard from '../../../components/house-card/HouseCard';
import SkeletonCard from '../../../components/skeleton-card/SkeletonCard';
import Select from '../../../components/UI/select/Select';
import Input from '../../../components/UI/input/Input';
import './houses.scss';


import FilterModal from '../../../components/filter-modal/FilterModal'; 

export default function Houses() {
  const { houses, getHouses, loading, toggleFavorite } = useHouseStore();
  const [filters, setFilters] = useState({
    city: '',
    roomCount: '',
    floor: '',
    minPrice: '',
    maxPrice: '',
    minMeterSquare: '',
    maxMeterSquare: '',
    adress: '',
    type: '',
    rentals: '',
    minRating: false,
  });

  const [sort, setSort] = useState('');

  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    if (parseInt(filters.minPrice) > parseInt(filters.maxPrice)) {
      setFilters((prev) => ({ ...prev, maxPrice: prev.minPrice }));
    }
    if (parseInt(filters.minMeterSquare) > parseInt(filters.maxMeterSquare)) {
      setFilters((prev) => ({ ...prev, maxMeterSquare: prev.minMeterSquare }));
    }
  }, [filters.minPrice, filters.maxPrice, filters.minMeterSquare, filters.maxMeterSquare]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const query = { ...filters };
      if (filters.minRating) query.minRating = 4.5;
      else delete query.minRating;
  
      getHouses({}, '');
    }, 300);
  
    return () => clearTimeout(timeout);
  }, [filters, sort]);
  

  return (
    <div className="houses-page container">
      <div className="filters-top-bar">

        <Select
          label="Сортировка"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          placeholder="Выберите сортировку"
        >
          <option value="">Без сортировки</option>
          <option value="price-desc">Цена ↓</option>
          <option value="price-asc">Цена ↑</option>
          <option value="rating-desc">Рейтинг</option>
          <option value="date-desc">По дате</option>
        </Select>

        <button className="btn-filter" onClick={() => setShowFilter(true)}>Фильтры</button>
      </div>

      <FilterModal
        open={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        setFilters={setFilters}
      />

      <div className="houses-list">
        {loading
          ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          : houses.map((house) => <HouseCard key={house.houseId} data={house} onToggleFavorite={toggleFavorite} />)}

        {!loading && houses.length === 0 && (
          <div className="empty-message">По вашему запросу ничего не найдено.</div>
        )}
      </div>
    </div>

  );
}
