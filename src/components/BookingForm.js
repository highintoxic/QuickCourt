"use client"

import { useState } from "react"

function BookingForm({ venue, onContinueToPayment, onBackToVenue }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: 1,
    court: "Court 1",
  })

  const timeSlots = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ]

  const courts = ["Court 1", "Court 2", "Court 3", "Court 4"]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const total = venue.price * formData.duration
    onContinueToPayment({
      ...formData,
      venue,
      total,
    })
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBackToVenue} className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Venue
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Court Booking</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Venue Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h2>
            <p className="text-gray-600">{venue.location}</p>
            <p className="text-green-600 font-semibold">₹{venue.price}/hour</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                min={getTomorrowDate()}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <select
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose time slot</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {[1, 2, 3, 4, 5].map((hour) => (
                  <option key={hour} value={hour}>
                    {hour} hour{hour > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Court Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Court</label>
              <div className="grid grid-cols-2 gap-3">
                {courts.map((court) => (
                  <label key={court} className="flex items-center">
                    <input
                      type="radio"
                      name="court"
                      value={court}
                      checked={formData.court === court}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{court}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Total Cost */}
            {formData.duration && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Cost:</span>
                  <span className="text-2xl font-bold text-green-600">₹{venue.price * formData.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.duration} hour{formData.duration > 1 ? "s" : ""} × ₹{venue.price}/hour
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
            >
              Continue to Payment → ₹{venue.price * formData.duration}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
