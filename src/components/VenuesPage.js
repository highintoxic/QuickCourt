"use client"

import { useState } from "react"

function VenuesPage({ onGetStarted, onBackToHome, onViewVenue }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const venues = [
    {
      id: 1,
      name: "Premium Court A",
      image: "/modern-indoor-badminton-court.png",
      location: "Downtown Sports Complex",
      price: "$50/hour",
      category: "badminton",
      rating: 4.8,
      amenities: ["AC", "Parking", "Changing Room"],
    },
    {
      id: 2,
      name: "Outdoor Court B",
      image: "/tennis-court.png",
      location: "City Park Recreation",
      price: "$35/hour",
      category: "tennis",
      rating: 4.5,
      amenities: ["Parking", "Lighting"],
    },
    {
      id: 3,
      name: "Indoor Arena C",
      image: "/indoor-basketball-court.png",
      location: "Metro Sports Center",
      price: "$75/hour",
      category: "basketball",
      rating: 4.9,
      amenities: ["AC", "Sound System", "Parking"],
    },
    {
      id: 4,
      name: "Community Court D",
      image: "/community-sports-court.png",
      location: "Neighborhood Club",
      price: "$25/hour",
      category: "multi-sport",
      rating: 4.2,
      amenities: ["Parking"],
    },
    {
      id: 5,
      name: "Professional Court E",
      image: "/professional-badminton-court.png",
      location: "Elite Sports Academy",
      price: "$100/hour",
      category: "badminton",
      rating: 5.0,
      amenities: ["AC", "Professional Equipment", "Coaching"],
    },
    {
      id: 6,
      name: "Multi-Sport Court F",
      image: "/placeholder-9r4k5.png",
      location: "University Campus",
      price: "$60/hour",
      category: "multi-sport",
      rating: 4.6,
      amenities: ["AC", "Parking", "Student Discount"],
    },
  ]

  const categories = [
    { id: "all", name: "All Sports" },
    { id: "badminton", name: "Badminton" },
    { id: "tennis", name: "Tennis" },
    { id: "basketball", name: "Basketball" },
    { id: "multi-sport", name: "Multi-Sport" },
  ]

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || venue.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
              <span className="text-xl font-semibold text-gray-800">QuickCourt</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={onBackToHome} className="text-gray-700 hover:text-teal-600 font-medium">
                Home
              </button>
              <button onClick={onGetStarted} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Court</h1>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search venues or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-teal-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => onViewVenue(venue)}
            >
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                <img src={venue.image || "/placeholder.svg"} alt={venue.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-gray-600">{venue.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{venue.location}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {venue.amenities.map((amenity, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-600">{venue.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onViewVenue(venue)
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-gray-500">No venues found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VenuesPage
