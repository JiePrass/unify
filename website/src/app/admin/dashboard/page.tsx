/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { getDashboardData } from "@/lib/api/admin"
import SummaryCard from "@/components/shared/summary-card"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    getDashboardData(2025).then((res) => {
      setData(res.data)
    })
  }, [])

  if (!data) return null

  const { summary, charts, topHelpers } = data

  return (
    <div className="flex flex-col gap-6">

      {/* SUMMARY */}
      <div className="grid md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Users"
          value={summary.totalUsers}
        />
        <SummaryCard
          title="Active Users"
          value={summary.activeUsers}
        />
        <SummaryCard
          title="Help Requests"
          value={summary.totalHelpRequests}
        />
        <SummaryCard
          title="Cancelled Requests"
          value={summary.cancelledHelpRequests}
        />
      </div>

      {/* ================= HELP TREND ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Help Request Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ total: { label: "Total" } }}>
            <LineChart data={charts.helpTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="total" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ================= USER TREND ================= */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{ total: { label: "Total" } }}>
            <BarChart data={charts.userTrend}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* ================= STATUS & REASONS ================= */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Help Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Total" } }}>
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={charts.helpStatus}
                  dataKey="total"
                  nameKey="status"
                  outerRadius={100}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancel Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ total: { label: "Total" } }}>
              <BarChart data={charts.cancelReasons}>
                <XAxis dataKey="reason" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ================= TOP HELPERS ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Top Helpers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topHelpers.map((u: any) => (
              <div
                key={u.id}
                className="flex justify-between border-b pb-2"
              >
                <span>{u.name}</span>
                <span>{u.completedHelps} helps</span>
                <span>⭐ {u.reputation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
