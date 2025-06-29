import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './header.scss';
import useAuthStore from '../../store/auth/authStore';
import userIcon from '../../assets/images/user-icon.svg';
import {
  HiOutlinePlus,
  HiOutlineChatAlt2,
  HiOutlineUser,
  HiOutlineHeart,
  HiOutlineSearch
} from 'react-icons/hi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { role, isAuth } = useAuthStore();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`header ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="container">
          <div className="logo">
            <Link to="/">Shanyraq</Link>
          </div>

          <nav className="nav">
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Главная</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>О нас</NavLink>
            {isAuth && role !== 'Арендодатель' && (
              <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>Избранное</NavLink>
            )}
          </nav>

          <div className="user-menu" ref={dropdownRef}>
            <button className="menu-btn" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <img src={userIcon} alt="user" width="40" />
            </button>

            {isDropdownOpen && (
              <div className="dropdown">
                <ul>
                  {!isAuth ? (
                    <>
                      <li><Link to="/register">Регистрация</Link></li>
                      <li><Link to="/login">Вход</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/profile">Профиль</Link></li>
                      {role === 'Арендодатель' ? (
                        <li><Link to="/house/create">Сдать жильё</Link></li>
                      ) : (
                        <li><Link to="/favorites">Избранные</Link></li>
                      )}
                      <li><Link to="/help">Помощь</Link></li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="mobile-nav">
        <NavLink to="/house" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineSearch />
          <span>Поиск</span>
        </NavLink>

        <NavLink
          to={role === 'Арендодатель' ? '/house/create' : '/favorites'}
          className={({ isActive }) => isActive ? 'active' : ''}
        >
          {role === 'Арендодатель' ? <HiOutlinePlus /> : <HiOutlineHeart />}
          <span>{role === 'Арендодатель' ? 'Создать' : 'Избранное'}</span>
        </NavLink>

        <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineChatAlt2 />
          <span>Чаты</span>
        </NavLink>

        <NavLink to={isAuth ? '/profile' : '/login'} className={({ isActive }) => isActive ? 'active' : ''}>
          <HiOutlineUser />
          <span>Профиль</span>
        </NavLink>
      </nav>
    </>
  );
}
