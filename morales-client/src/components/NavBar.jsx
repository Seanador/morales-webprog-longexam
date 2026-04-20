import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/img/nubdexchange_logo.png';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
];

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/auth/signin');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-blue-900 bg-blue-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

        <NavLink to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="BulldogEx"
            className="h-9 w-9 rounded-full border-2 border-blue-900 bg-white object-contain"
          />
          <div className="space-y-0.5">
            <p className="text-3xl font-bold text-blue-900">
              <span className="text-yellow-500">BulldogEx</span> Shop
            </p>
          </div>  
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-4">

            {/* pill container design for navigation links and added an active state design - NavBar.jsx */}
            <div className="flex items-center gap-2 rounded-full bg-blue-900 px-2 py-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-200',
                      isActive
                        ? 'bg-yellow-400 text-blue-900 shadow-sm'
                        : 'text-blue-100 hover:text-yellow-300',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <button
              onClick={handleLogin}
              className="rounded-full bg-yellow-500 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black hover:bg-yellow-600 transition-all duration-200"
            >
              Login
            </button>

          </div>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;