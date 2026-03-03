const variantClasses = {
  digit:
    'bg-slate-700/80 text-slate-100 hover:bg-slate-600 active:bg-slate-500',
  operator:
    'bg-cyan-600/90 text-cyan-50 hover:bg-cyan-500 active:bg-cyan-400',
  action:
    'bg-rose-600/90 text-rose-50 hover:bg-rose-500 active:bg-rose-400',
  equals:
    'bg-emerald-600/90 text-emerald-50 hover:bg-emerald-500 active:bg-emerald-400',
}

function CalculatorButton({
  label,
  onClick,
  variant = 'digit',
  className = '',
  title,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`h-14 rounded-xl text-xl font-semibold transition duration-150 active:scale-95 md:h-16 md:text-2xl ${variantClasses[variant]} ${className}`}
    >
      {label}
    </button>
  )
}

export default CalculatorButton
