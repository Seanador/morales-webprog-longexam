import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="border-t-4 border-yellow-400 bg-blue-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-zinc-50 sm:flex-row sm:items-center sm:justify-between">
        
        <div>
          <p className="text-lg font-bold">
            <span className="text-yellow-400">BulldogEx Shop</span>
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Campus essentials, simple ordering.
          </p>
        </div>

        <div className="flex gap-4 text-[11px] font-semibold uppercase tracking-[0.24em]">
          <NavLink
            to="/products"
            className="text-zinc-300 hover:text-yellow-400 transition"
          >
            Products
          </NavLink>

          <NavLink
            to="/about"
            className="text-zinc-300 hover:text-yellow-400 transition"
          >
            About Us
          </NavLink>

          <NavLink
            to="/auth/signup"
            className="text-zinc-300 hover:text-yellow-400 transition"
          >
            Get Started
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default Footer;