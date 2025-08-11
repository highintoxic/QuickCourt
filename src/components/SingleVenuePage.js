"use client"

import { useState } from "react"

function SingleVenuePage({ venue, onBookNow, onBackToVenues }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const venueImages = [
    venue.image || "/placeholder.svg?height=400&width=600",
    "/sports-facility-interior.png",
    "/assorted-sports-gear.png",
    "/changing-room.png",
  ]

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>,
      )
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>,
      )
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <span key={i} className="text-gray-300">
          ★
        </span>,
      )
    }
    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBackToVenues} className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Venues
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="mb-4">
              <img
                src={venueImages[selectedImageIndex] || "/placeholder.svg"}
                alt={venue.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {venueImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-20 rounded-lg overflow-hidden ${
                    selectedImageIndex === index ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${venue.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Venue Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h2>
              <p className="text-gray-600 flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {venue.location}
              </p>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  {renderStars(venue.rating)}
                  <span className="ml-2 text-gray-600">({venue.rating})</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{venue.type}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{venue.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((amenity, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-green-600">₹{venue.price}</span>
                  <span className="text-gray-500 ml-2">/hour</span>
                </div>
              </div>
              <button
                onClick={onBookNow}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
              >
                Book This Venue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SingleVenuePage
