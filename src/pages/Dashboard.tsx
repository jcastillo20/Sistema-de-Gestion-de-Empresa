import { Users, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const stats = [
  { name: 'Pacientes Activos', value: '1,240', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Citas Hoy', value: '42', icon: CalendarCheck, change: '4 canceladas', changeType: 'negative' },
  { name: 'Ingresos Mensuales', value: '$24,500', icon: TrendingUp, change: '+8.2%', changeType: 'positive' },
  { name: 'Horas Terapéuticas', value: '320h', icon: Clock, change: 'Este mes', changeType: 'neutral' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className={
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 
                  'text-gray-500'
                }>
                  {stat.change}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Módulo de Auditoría / Actividad
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Próximas Citas</h3>
          <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
            Módulo de Agenda Rápida
          </div>
        </motion.div>
      </div>
    </div>
  );
}
