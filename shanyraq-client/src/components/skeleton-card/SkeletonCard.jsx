import React from 'react';
import styles from './skeleton-card.module.scss';

export default function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonInfo}>
        <div className={styles.skeletonText} />
        <div className={`${styles.skeletonText} ${styles.short}`} />
      </div>
    </div>
  );
}
