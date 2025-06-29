import './footer.scss';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">Shanyraq</div>
          <p>Платформа аренды жилья по всему Казахстану.</p>
        </div>

        <div className="footer-section">
          <h4>Контакты</h4>
          <p>Email: info@zharys.kz</p>
          <p>Тел: +7 (777) 123 45 67</p>
        </div>

        <div className="footer-section">
          <h4>Навигация</h4>
          <ul>
            <li><a href="/">Главная</a></li>
            <li><a href="/house">Недвижимость</a></li>
            <li><a href="/contact">Контакты</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Zharys. Все права защищены.</p>
      </div>
    </footer>
  );
}
