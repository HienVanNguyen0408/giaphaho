'use client'

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '../shared/Card'
import type { MonthlyData } from '@/types'

interface ChartsProps {
  monthlyData: MonthlyData[]
  licenseBreakdown: { permanent: number; subscription: number }
}

const ACCENT = '#8B0000'
const BLUE = '#1e40af'

export function Charts({ monthlyData, licenseBreakdown }: ChartsProps) {
  const pieData = [
    { name: 'Vĩnh viễn', value: licenseBreakdown.permanent },
    { name: 'Thuê bao', value: licenseBreakdown.subscription },
  ]

  const total = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Line chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
            Họ mới theo tháng
          </h3>
          <span className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
            {monthlyData.length} tháng gần nhất
          </span>
        </div>
        <ResponsiveContainer width="100%" height={196}>
          <LineChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--t-border)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'var(--t-text-3)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--t-text-3)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--t-surface)',
                border: '1px solid var(--t-border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--t-text)',
              }}
              itemStyle={{ color: ACCENT }}
              cursor={{ stroke: 'var(--t-border)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2}
              dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: ACCENT, strokeWidth: 0 }}
              name="Họ mới"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--t-text)' }}>
            Phân loại license
          </h3>
          <span className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
            Tổng {total} họ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="60%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={76}
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === 0 ? ACCENT : BLUE}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--t-surface)',
                  border: '1px solid var(--t-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--t-text)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-col gap-3 flex-1">
            {pieData.map((entry, i) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0
              return (
                <div key={entry.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: i === 0 ? ACCENT : BLUE }}
                    />
                    <span className="text-[12px]" style={{ color: 'var(--t-text-2)' }}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-lg font-bold"
                      style={{ color: 'var(--t-text)', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {entry.value}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--t-text-3)' }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
