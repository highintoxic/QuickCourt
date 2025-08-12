import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { CalendarDays, DollarSign, Activity } from "lucide-react"
import { useState } from "react"

// Sample data for charts
const bookingTrends = [
  { name: "Mon", bookings: 12 },
  { name: "Tue", bookings: 19 },
  { name: "Wed", bookings: 15 },
  { name: "Thu", bookings: 22 },
  { name: "Fri", bookings: 28 },
  { name: "Sat", bookings: 35 },
  { name: "Sun", bookings: 30 },
]

const earningsData = [
  { name: "Court 1", earnings: 1200 },
  { name: "Court 2", earnings: 980 },
  { name: "Court 3", earnings: 1450 },
  { name: "Court 4", earnings: 890 },
]

const peakHours = [
  { hour: "6AM", bookings: 2 },
  { hour: "8AM", bookings: 8 },
  { hour: "10AM", bookings: 15 },
  { hour: "12PM", bookings: 25 },
  { hour: "2PM", bookings: 20 },
  { hour: "4PM", bookings: 30 },
  { hour: "6PM", bookings: 35 },
  { hour: "8PM", bookings: 28 },
  { hour: "10PM", bookings: 12 },
]

const COLORS = ["#22c55e", "#16a34a", "#15803d", "#166534"]

export default function FacilityDashboard() {
  const [date, setDate] = useState(new Date())

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-green-100 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Facility Owner Dashboard</h1>
          <p className="text-green-600 font-medium">Welcome back! Here's your facility overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1,247</div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Courts</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4</div>
              <p className="text-xs text-green-600 mt-1">All courts operational</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">$4,520</div>
              <p className="text-xs text-green-600 mt-1">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Calendar */}
          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Booking Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-green-200" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Today: 8 bookings
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    Tomorrow: 12 bookings
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Booking Trends */}
            <Card className="border-green-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Weekly Booking Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #22c55e",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="bookings" stroke="#22c55e" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Earnings and Peak Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Summary */}
              <Card className="border-green-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Earnings by Court</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={earningsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="earnings"
                        label={({ name, value }) => `${name}: $${value}`}
                      >
                        {earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Peak Booking Hours */}
              <Card className="border-green-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Peak Booking Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="hour" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #22c55e",
                          borderRadius: "8px",
                        }}
                      />
                      <Area type="monotone" dataKey="bookings" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}