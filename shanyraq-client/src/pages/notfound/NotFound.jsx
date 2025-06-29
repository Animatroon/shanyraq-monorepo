import React from 'react';
import './not-found.scss';
import { Link } from 'react-router-dom';



export default function NotFound() {
  return (
    <div className="notfound-page">
      <main className="notfound-content">
        <h4>404</h4>
        <p>Страница не найдена</p>
        <Link to='/' className='btn-back'>Вернуться на главную</Link>
      </main>
    </div>
  );
}
