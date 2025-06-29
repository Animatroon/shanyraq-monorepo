import React from 'react';
import { FaHeart, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './house-card.module.scss';

const BASE_URL = process.env.REACT_APP_API_URL;

export default function HouseCard({ data, onToggleFavorite }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault(); 
    if (onToggleFavorite) onToggleFavorite(data.houseId);
  };

  return (
    <Link to={`/house/${data.houseId}`} className={styles.card}>
      <div className={styles.image}>
        <img src={`${BASE_URL}${data.images[0]}`} alt="House" />
        <button
          className={`${styles.likeBtn} ${data.isFavorite ? styles.liked : ''}`}
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(data.houseId);
          }}
        >
          <FaHeart />
        </button>
        <div className={styles.rating}>
          <FaStar /> {(data.avgRating ?? 0).toFixed(1)}
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.price}>{data.price.toLocaleString()} ₸</div>
        <div className={styles.owner}>{data.landlordName}</div>
      </div>
    </Link>
  );
}
