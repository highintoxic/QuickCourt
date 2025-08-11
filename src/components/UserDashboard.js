"use client"

import { useState } from "react"

function UserDashboard({ user, onUpdateUser, onBackToHome, onVenuesClick }) {
  const [activeSection, setActiveSection] = useState("bookings")
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user.name,
    email: user.email,
    oldPassword: "",
    newPassword: "",
  })

  // Sample booking data
  const bookings = [
    {
      id: 1,
      venue: "Skyline Badminton Court (Badminton)",
      date: "18 June 2024",
      time: "9:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "Court Booking",
      review: "Write Review",
    },
    {
      id: 2,
      venue: "Skyline Badminton Court (Badminton)",
      date: "18 June 2024",
      time: "9:00 PM - 6:00 PM",
      location: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "Court Booking",
      review: "Write Review",
    },
  ]

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSaveProfile = () => {
    onUpdateUser({
      ...user,
      name: formData.fullName,
      email: formData.email,
    })
    setIsEditing(false)
    // Reset password fields
    setFormData({
      ...formData,
      oldPassword: "",
      newPassword: "",
    })
  }

  const handleReset = () => {
    setFormData({
      fullName: user.name,
      email: user.email,
      oldPassword: "",
      newPassword: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-semibold text-gray-800">QUICKCOURT</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={onVenuesClick} className="text-gray-700 hover:text-teal-600 font-medium">
                Book
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mitchell Admin</span>
                <button onClick={onBackToHome} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Page</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.phone}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 mb-4"
              >
                Edit Profile
              </button>

              {/* Navigation Menu */}
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection("bookings")}
                  className={`w-full text-left py-2 px-4 rounded-lg ${
                    activeSection === "bookings"
                      ? "bg-green-100 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Bookings
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeSection === "bookings" && !isEditing && (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Bookings Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="text-sm">Cancelled</span>
                    </button>
                  </div>
                </div>

                {/* Bookings List */}
                <div className="p-6">
                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-blue-600">📅</span>
                                <span className="text-sm font-medium">{booking.venue}</span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  📅 {booking.date} ⏰ {booking.time}
                                </p>
                                <p>📍 {booking.location}</p>
                                <div className="flex items-center gap-2">
                                  <span>Status:</span>
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    ✓ {booking.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <button className="text-blue-600 text-sm hover:underline">
                                [{booking.type}] [{booking.review}]
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-1a4 4 0 014-4h4a4 4 0 014 4v1a4 4 0 11-8 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">No recent booking history for past dates</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Edit Form */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Edit Profile</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Old Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">👁</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">👁</button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
