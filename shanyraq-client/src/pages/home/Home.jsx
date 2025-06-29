import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';


import './home.scss';
import HouseCard from '../../components/house-card/HouseCard';
import SkeletonCard from '../../components/skeleton-card/SkeletonCard';
import apart1 from '../../assets/images/apart-1.jpg';
import apart2 from '../../assets/images/apart-2.jpg';
import apart3 from '../../assets/images/apart-3.jpg';
import Input from '../../components/UI/input/Input';
import Select from '../../components/UI/select/Select';
import Lodaing from '../Loading/loading';
import useHouseStore from '../../store/House/houseStore';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    rooms: '',
    priceRange: '50000 - 150000',
  });
  const { houses, getHouses } = useHouseStore()
  const loadingHouse = useHouseStore((state) => state.loading);
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const apartments = houses.slice(0,4)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    getHouses()


    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Lodaing/>
    );
  }

  return (
    <>
      <section className="home-hero">
        <h1>Shanyraq</h1>
        <p>Жоғары рейтингтер мен тиімді бағалар</p>

        <div className="filter-form">
          <h3>Что вы ищете?</h3>
          <div className="form-row">
            <div className="form-control">
              <label>Город</label>
              <Select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                <option value="">Выберите город</option>
                <option value="Алматы">Алматы</option>
                <option value="Астана">Астана</option>
                <option value="Шымкент">Шымкент</option>
              </Select>
            </div>

            <div className="form-control">
              <label>Количество комнат</label>
              <Select value={filters.rooms} onChange={(e) => setFilters({ ...filters, rooms: e.target.value })}>
                <option value="">Кол-во комнат</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>

            <div className="form-control">
              <label>Диапазон цен</label>
              <Input
                value={filters.priceRange}
                onChange={(e) => {
                  let raw = e.target.value.replace(/[^\d-]/g, '');

                  if (!raw.includes('-')) {
                    if (raw.length > 6) raw = raw.slice(0, 6) + ' - ' + raw.slice(6);
                    else raw += ' - ';
                  }

                  const [minRaw = '', maxRaw = ''] = raw.split('-').map((v) => v.trim());
                  const formatted = `${minRaw.slice(0, 6)} - ${maxRaw.slice(0, 6)}`;
                  setFilters({ ...filters, priceRange: formatted });
                }}
                onBlur={() => {
                  let [minRaw = '', maxRaw = ''] = filters.priceRange
                    .split('-')
                    .map((v) => v.trim());

                  let min = parseInt(minRaw || '0', 10);
                  let max = parseInt(maxRaw || '0', 10);

                  if (max < min) max = min;

                  const corrected = `${min} - ${max}`;
                  setFilters({ ...filters, priceRange: corrected });
                }}
                placeholder="10000 - 50000"                                       
              />



            </div>

            <button className="btn-search">Поиск</button>
          </div>
        </div>
      </section>

      <section className="apartment-section">
        <div className="container">
          <div className="apartment-list">
            { loadingHouse ? 
              [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
              apartments.map((house) => <HouseCard key={house.houseId} data={house} onToggleFavorite={toggleFavorite} />)
            }
          </div>
          <div className="show-more">
            <button className="btn-animated" onClick={() => navigate('/house')}>
              <span>Показать больше</span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
