import React from 'react';
import './filter-modal.scss';
import Select from '../UI/select/Select';
import Input from '../UI/input/Input';

export default function FilterModal({ open, onClose, filters, setFilters, onApply }) {
  if (!open) return null;

  const apply = () => {
    onApply();
    onClose();
  };

  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal">
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="filter-block">
          <label>Город</label>
          <Select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="Выберите город"
          >
            <option value="">Все города</option>
            <option value="Алматы">Алматы</option>
            <option value="Астана">Астана</option>
          </Select>
        </div>

        <div className="filter-block">
          <label>Комнаты</label>
          <Select
            value={filters.roomCount}
            onChange={(e) => setFilters({ ...filters, roomCount: e.target.value })}
            placeholder="Выберите количество комнат"
          >
            <option value="">Все</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </Select>
        </div>

        <div className="filter-block">
          <label>Площадь от</label>
          <Input
            type="number"
            placeholder="Например, 50"
            value={filters.minMeterSquare}
            onChange={(e) => setFilters({ ...filters, minMeterSquare: e.target.value })}
          />
        </div>

        <div className="filter-block">
          <label>Площадь до</label>
          <Input
            type="number"
            placeholder="Например, 150"
            value={filters.maxMeterSquare}
            onChange={(e) => setFilters({ ...filters, maxMeterSquare: e.target.value })}
          />
        </div>

        <div className="filter-block">
          <label>Цена от</label>
          <Input
            type="number"
            placeholder="Минимум"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
        </div>

        <div className="filter-block">
          <label>Цена до</label>
          <Input
            type="number"
            placeholder="Максимум"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>

        <div className="filter-block checkbox">
          <label>
            <input
              type="checkbox"
              checked={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.checked })}
            />
            Высокий рейтинг (от 4.5)
          </label>
        </div>

        <button className="btn-apply" onClick={apply}>Применить</button>
      </div>
    </div>
  );
}
