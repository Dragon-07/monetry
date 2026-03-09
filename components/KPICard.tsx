import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number
  icon: 'income' | 'expense' | 'balance' | 'transactions'
  color: 'green' | 'red' | 'blue'
}

export function KPICard({ title, value, icon, color }: KPICardProps) {
  const colorMap = {
    green: {
      text: 'text-green-600 dark:text-green-400',
      bgBlur: 'bg-green-400/20',
      iconStr: 'trending_up'
    },
    red: {
      text: 'text-red-600 dark:text-red-400',
      bgBlur: 'bg-red-400/20',
      iconStr: 'trending_down'
    },
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      bgBlur: 'bg-blue-400/20',
      iconStr: 'account_balance_wallet'
    }
  }

  // Handle transactions using an alternative color map if not matching the default three
  const config = colorMap[color] || {
    text: 'text-purple-600 dark:text-purple-400',
    bgBlur: 'bg-purple-400/20',
    iconStr: 'show_chart'
  }

  // Override icon for transactions specifically
  if (icon === 'transactions') {
    config.text = 'text-purple-600 dark:text-purple-400'
    config.bgBlur = 'bg-purple-400/20'
    config.iconStr = 'show_chart'
  }

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{title}</h3>
        <div className="glass-panel p-2 rounded-lg flex items-center justify-center">
          <span className={`material-icons ${config.text}`}>{config.iconStr}</span>
        </div>
      </div>
      <div className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
        {icon === 'transactions' ? value : `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
      </div>
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${config.bgBlur} rounded-full blur-2xl`}></div>
    </div>
  )
}
