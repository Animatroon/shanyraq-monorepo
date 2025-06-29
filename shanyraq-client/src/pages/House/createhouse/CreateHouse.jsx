import React, { useState } from 'react';
import useHouseStore from '../../../store/House/houseStore';
import AlertModal from '../../../components/UI/alert-modal/AlertModal';
import './create-house.scss';

const cities = [
  'Алматы', 'Астана', 'Шымкент', 'Актобе', 'Караганда',
  'Павлодар', 'Тараз', 'Уральск', 'Семей', 'Костанай',
  'Кокшетау', 'Кызылорда', 'Петропавловск', 'Актау', 'Атырау',
  'Талдыкорган', 'Экибастуз', 'Риддер', 'Туркестан', 'Жезказган'
];

const rentalsTypes = ['monthly', 'daily', 'hourly'];
const houseTypes = ['Dom', 'Apartment'];

export default function CreateHouse() {
  const isMobile = window.innerWidth < 768;
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: 'Apartment',
    rentals: 'monthly',
    city: '',
    adress: '',
    roomCount: '',
    meterSquare: '',
    floor: '',
    price: '',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [alert, setAlert] = useState(null);

  const { createHouse } = useHouseStore();

  const handleRemoveImage = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => setFiles([...e.target.files]);

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    files.forEach((file) => formData.append('imagesйцукенгшж', file));

    const requiredFields = [
      'type', 'rentals', 'city', 'adress',
      'roomCount', 'meterSquare', 'floor',
      'price', 'description'
    ];
    
    for (const field of requiredFields) {
      if (!form[field]) {
        setAlert({ message: `Поле "${field}" обязательно` });
        return;
      }
    }
    
    if (files.length < 5) {
      setAlert({ message: 'Добавьте минимум 5 фотографий' });
      return;
    }

    try {
      await createHouse(formData);
      setAlert({ message: 'Объявление успешно создано' });
    } catch (err) {
      console.error(err);
      setAlert({ message: err?.response?.data?.message || 'Ошибка при создании' });
    }
  };

  const renderFields = () => (
    <>
      <div className="field-group">
        <label>Тип жилья</label>
        <div className="custom-radio">
          {houseTypes.map((t) => (
            <label key={t}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
              <span>{t === 'Dom' ? 'Дом' : 'Квартира'}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Условия аренды</label>
        <div className="custom-radio">
          {rentalsTypes.map((r) => (
            <label key={r}>
              <input type="radio" name="rentals" value={r} checked={form.rentals === r} onChange={handleChange} />
              <span>
                {r === 'monthly' ? 'Помесячно' : r === 'daily' ? 'Посуточно' : 'Почасово'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="field-group">
        <label>Город</label>
        <select name="city" value={form.city} onChange={handleChange}>
          <option value="">Выберите город</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label>Адрес</label>
        <input name="adress" value={form.adress} onChange={handleChange} />
      </div>

      <div className="field-group">
        <label>Комнат</label>
        <input name="roomCount" type="number" value={form.roomCount} onChange={handleChange} />
      </div>

      <div className="field-group">
        <label>Площадь (м²)</label>
        <input name="meterSquare" type="number" value={form.meterSquare} onChange={handleChange} />
      </div>

      <div className="field-group">
        <label>Этаж</label>
        <input name="floor" type="number" value={form.floor} onChange={handleChange} />
      </div>

      <div className="field-group">
        <label>Цена (₸)</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} />
      </div>

      <div className="field-group field-group-desc">
        <label>Описание</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => {
            handleChange(e);
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
        />

      </div>

      <div className="field-group">
        <label>Фотографии</label>
        <input type="file" multiple onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
      <div className="image-preview-grid">
        {files.map((file, index) => (
          <div className="preview-item" key={index}>
            <img src={URL.createObjectURL(file)} alt={`img-${index}`} />
            <button type="button" onClick={() => handleRemoveImage(index)}>×</button>
          </div>
        ))}
      </div>
    )}
    </>
  );

  const renderStep = () => {
    if (!isMobile) return renderFields();

    if (step === 1) {
      return (
        <>
          <div className="field-group">
            <label>Тип жилья</label>
            <div className="custom-radio">
              {houseTypes.map((t) => (
                <label key={t}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
                  <span>{t === 'Dom' ? 'Дом' : 'Квартира'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Город</label>
            <select name="city" value={form.city} onChange={handleChange}>
              <option value="">Выберите город</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Адрес</label>
            <input name="adress" value={form.adress} onChange={handleChange} />
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <div className="field-group">
            <label>Комнат</label>
            <input name="roomCount" type="number" value={form.roomCount} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label>Площадь (м²)</label>
            <input name="meterSquare" type="number" value={form.meterSquare} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label>Этаж</label>
            <input name="floor" type="number" value={form.floor} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label>Цена (₸)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} />
          </div>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <div className="field-group">
            <label>Условия аренды</label>
            <div className="custom-radio">
              {rentalsTypes.map((r) => (
                <label key={r}>
                  <input type="radio" name="rentals" value={r} checked={form.rentals === r} onChange={handleChange} />
                  <span>
                    {r === 'monthly' ? 'Помесячно' : r === 'daily' ? 'Посуточно' : 'Почасово'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => {
                handleChange(e);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
            />

          </div>

          <div className="field-group">
            <label>Фотографии</label>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          {files.length > 0 && (
            <div className="image-preview-grid">
              {files.map((file, index) => (
                <div className="preview-item" key={index}>
                  <img src={URL.createObjectURL(file)} alt={`img-${index}`} />
                  <button type="button" onClick={() => handleRemoveImage(index)}>×</button>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
  };

  return (
    <div className="create-house">
      <h1>Создание объявления</h1>
      {renderStep()}
      <div className="buttons">
        {isMobile && step > 1 && <button onClick={() => setStep(step - 1)}>Назад</button>}
        {isMobile && step < 3 && <button onClick={() => setStep(step + 1)}>Далее</button>}
        {(!isMobile || step === 3) && <button onClick={handleSubmit}>Опубликовать</button>}
      </div>

      {alert && (
        <AlertModal message={alert.message} onClose={() => setAlert(null)} duration={3000} />
      )}
    </div>
  );
}
