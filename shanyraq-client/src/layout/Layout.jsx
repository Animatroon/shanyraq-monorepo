import Footer from '../components/footer/Footer';
import Header from '../components/header/Header';
import '../styles/styles.scss';
import { useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      <Header />
      <main style={{ paddingTop: isHome ? '65px' : '80px' }}>
        {children}
      </main>
      <Footer/>
    </>
  );
}
