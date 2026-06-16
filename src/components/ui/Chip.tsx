import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  bgColor?: string
  textColor?: string
  className?: string
  onClick?: () => void
}

function Chip({ label, bgColor = 'bg-primary-fixed', textColor = 'text-on-primary-fixed-variant', className, onClick }: ChipProps) {
  const classes = cn(
    'inline-flex items-center px-2.5 py-0.5 rounded-md font-label text-label-sm uppercase',
    bgColor,
    textColor,
    onClick && 'cursor-pointer hover:brightness-95 transition',
    className,
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {label}
      </button>
    )
  }

  return <span className={classes}>{label}</span>
}

export { Chip }
export type { ChipProps }
