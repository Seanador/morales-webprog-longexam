import { Link } from 'react-router-dom';

// change button colors to NU colors and add hover states - Button.jsx
const variantClasses = {
  primary: 'bg-yellow-400 text-blue-900 hover:bg-yellow-300',
  secondary: 'bg-blue-900 text-blue-50 hover:bg-blue-800',
};

const Button = ({
  children,
  to,
  type = 'button',
  variant = 'secondary',
  className = '',
}) => {
  const classes = [
    'inline-flex items-center justify-center rounded-full border-2 border-blue-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] transition active:scale-[0.98]',
    variantClasses[variant] ?? variantClasses.secondary,
    className,
  ]
    .join(' ')
    .trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
};

export default Button;