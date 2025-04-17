"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    cashIn: 4000,
    cashOut: 2400,
  },
  {
    name: "Feb",
    cashIn: 3000,
    cashOut: 1398,
  },
  {
    name: "Mar",
    cashIn: 2000,
    cashOut: 9800,
  },
  {
    name: "Apr",
    cashIn: 2780,
    cashOut: 3908,
  },
  {
    name: "May",
    cashIn: 1890,
    cashOut: 4800,
  },
  {
    name: "Jun",
    cashIn: 2390,
    cashOut: 3800,
  },
  {
    name: "Jul",
    cashIn: 3490,
    cashOut: 4300,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="cashIn" name="Cash In" fill="#22c55e" />
        <Bar dataKey="cashOut" name="Cash Out" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}
