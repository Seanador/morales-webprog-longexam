import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logo from '../assets/img/nubdexchange_logo.png';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSupplier, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogin = () => {
    navigate('/auth/signin');
  };
  const handleLogout = () => { logout(); setConfirmingLogout(false); navigate('/'); };

  return (
    <>
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
              {(isAdmin || isSupplier) ? <NavLink to="/dashboard" className={({ isActive }) => ['rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-200', isActive ? 'bg-yellow-400 text-blue-900 shadow-sm' : 'text-blue-100 hover:text-yellow-300'].join(' ')}>Dashboard</NavLink> : null}
              {user && !isAdmin && !isSupplier ? <NavLink to="/cart" className={({ isActive }) => ['rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-200', isActive ? 'bg-yellow-400 text-blue-900 shadow-sm' : 'text-blue-100 hover:text-yellow-300'].join(' ')}>Cart</NavLink> : null}
              {user && !isAdmin && !isSupplier ? <NavLink to="/orders" className={({ isActive }) => ['rounded-full px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-all duration-200', isActive ? 'bg-yellow-400 text-blue-900 shadow-sm' : 'text-blue-100 hover:text-yellow-300'].join(' ')}>My Orders</NavLink> : null}
            </div>

            {user ? <div className="flex items-center gap-3"><span className="text-xs font-semibold text-blue-900">Hi, {user.firstName}</span><button onClick={() => setConfirmingLogout(true)} className="rounded-full bg-yellow-500 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black hover:bg-yellow-600 transition-all duration-200">Log out</button></div> : <button onClick={handleLogin} className="rounded-full bg-yellow-500 px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-black hover:bg-yellow-600 transition-all duration-200">Login</button>}

          </div>
        </nav>
      </div>
    </header>
      {confirmingLogout ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-950/50 px-4" role="dialog" aria-modal="true" aria-labelledby="logout-title"><div className="w-full max-w-sm rounded-3xl border-2 border-blue-900 bg-blue-50 p-6 shadow-xl"><p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Account</p><h2 id="logout-title" className="mt-2 text-xl font-bold text-blue-900">Log out of BulldogEx?</h2><p className="mt-3 text-sm leading-6 text-zinc-700">Your current session will end on this device.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setConfirmingLogout(false)} className="rounded-full border-2 border-blue-900 bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-900">Cancel</button><button onClick={handleLogout} className="rounded-full bg-yellow-400 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-900">Log out</button></div></div></div> : null}
    </>
  );
};

export default NavBar;
