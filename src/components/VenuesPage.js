import React, { useState, useEffect } from 'react';

function VenuesPage({ onGetStarted, onBackToHome }) {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    priceRange: '',
    venueType: '',
    rating: '',
    amenities: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const venuesPerPage = 12;

  // Sample venue data
  const sampleVenues = [
    {
      id: 1,
      name: "Premium Sports Arena",
      location: "Ahmedabad West",
      price: 75,
      rating: 4.8,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["Parking", "AC", "Changing Room", "Equipment"],
      description: "State-of-the-art indoor sports facility"
    },
    {
      id: 2,
      name: "City Park Courts",
      location: "Ahmedabad East",
      price: 45,
      rating: 4.5,
      image: "/placeholder.svg?height=200&width=300",
      type: "Outdoor",
      amenities: ["Parking", "Lighting", "Seating"],
      description: "Beautiful outdoor courts in the heart of the city"
    },
    {
      id: 3,
      name: "Elite Badminton Club",
      location: "Ahmedabad Central",
      price: 90,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["AC", "Professional Courts", "Coaching", "Equipment"],
      description: "Professional badminton facility with expert coaching"
    },
    {
      id: 4,
      name: "Community Sports Center",
      location: "Ahmedabad North",
      price: 30,
      rating: 4.2,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["Parking", "Basic Facilities"],
      description: "Affordable community sports facility"
    },
    {
      id: 5,
      name: "Riverside Tennis Courts",
      location: "Ahmedabad South",
      price: 60,
      rating: 4.6,
      image: "/placeholder.svg?height=200&width=300",
      type: "Outdoor",
      amenities: ["Scenic View", "Parking", "Lighting"],
      description: "Tennis courts with beautiful riverside views"
    },
    {
      id: 6,
      name: "Metro Sports Complex",
      location: "Ahmedabad West",
      price: 85,
      rating: 4.7,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["AC", "Multiple Courts", "Cafeteria", "Parking"],
      description: "Large sports complex with multiple facilities"
    },
    {
      id: 7,
      name: "Garden View Courts",
      location: "Ahmedabad East",
      price: 50,
      rating: 4.4,
      image: "/placeholder.svg?height=200&width=300",
      type: "Outdoor",
      amenities: ["Garden View", "Parking", "Seating"],
      description: "Peaceful courts surrounded by gardens"
    },
    {
      id: 8,
      name: "Professional Arena",
      location: "Ahmedabad Central",
      price: 100,
      rating: 4.9,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["Professional Grade", "AC", "Live Streaming", "Equipment"],
      description: "Tournament-grade professional sports arena"
    },
    {
      id: 9,
      name: "Sunset Sports Club",
      location: "Ahmedabad West",
      price: 55,
      rating: 4.3,
      image: "/placeholder.svg?height=200&width=300",
      type: "Outdoor",
      amenities: ["Evening Lighting", "Parking", "Refreshments"],
      description: "Perfect for evening games with great lighting"
    },
    {
      id: 10,
      name: "University Sports Center",
      location: "Ahmedabad North",
      price: 40,
      rating: 4.1,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["Student Discount", "Basic Facilities", "Parking"],
      description: "University-affiliated sports facility"
    },
    {
      id: 11,
      name: "Luxury Sports Resort",
      location: "Ahmedabad South",
      price: 120,
      rating: 5.0,
      image: "/placeholder.svg?height=200&width=300",
      type: "Indoor",
      amenities: ["Luxury", "Spa", "Restaurant", "Valet Parking"],
      description: "Premium luxury sports and wellness facility"
    },
    {
      id: 12,
      name: "Neighborhood Courts",
      location: "Ahmedabad East",
      price: 25,
      rating: 3.9,
      image: "/placeholder.svg?height=200&width=300",
      type: "Outdoor",
      amenities: ["Basic Facilities", "Affordable"],
      description: "Simple and affordable neighborhood courts"
    }
  ];

  useEffect(() => {
    // Simulate loading venues
    setIsLoading(true);
    setTimeout(() => {
      setVenues(sampleVenues);
      setFilteredVenues(sampleVenues);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter venues based on current filters
  useEffect(() => {
    let filtered = venues.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                           venue.location.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesLocation = !filters.location || venue.location === filters.location;
      
      const matchesType = !filters.venueType || venue.type === filters.venueType;
      
      const matchesPrice = !filters.priceRange || 
        (filters.priceRange === 'low' && venue.price <= 50) ||
        (filters.priceRange === 'medium' && venue.price > 50 && venue.price <= 80) ||
        (filters.priceRange === 'high' && venue.price > 80);
      
      const matchesRating = !filters.rating || venue.rating >= parseFloat(filters.rating);

      return matchesSearch && matchesLocation && matchesType && matchesPrice && matchesRating;
    });

    setFilteredVenues(filtered);
    setCurrentPage(1);
  }, [filters, venues]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearch = () => {
    // Search is handled automatically by useEffect
    console.log('Searching with filters:', filters);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      priceRange: '',
      venueType: '',
      rating: '',
      amenities: []
    });
  };

  // Pagination
  const indexOfLastVenue = currentPage * venuesPerPage;
  const indexOfFirstVenue = indexOfLastVenue - venuesPerPage;
  const currentVenues = filteredVenues.slice(indexOfFirstVenue, indexOfLastVenue);
  const totalPages = Math.ceil(filteredVenues.length / venuesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVenueBook = (venue) => {
    console.log('Booking venue:', venue);
    onGetStarted(); // Redirect to auth for booking
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">☆</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      );
    }

    return stars;
  };

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
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={onBackToHome}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Home
              </button>
              <span className="text-teal-600 font-medium">Venues</span>
              <a href="#" className="text-gray-700 hover:text-teal-600 font-medium">Court Booking</a>
              <button 
                onClick={onGetStarted}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sports Venues in Ahmedabad: Discover and Book Amazing Venues
          </h1>
          <p className="text-gray-600">
            Find and book the perfect sports venue for your game. {filteredVenues.length} venues available.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Venues
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by name or location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Locations</option>
                  <option value="Ahmedabad West">Ahmedabad West</option>
                  <option value="Ahmedabad East">Ahmedabad East</option>
                  <option value="Ahmedabad Central">Ahmedabad Central</option>
                  <option value="Ahmedabad North">Ahmedabad North</option>
                  <option value="Ahmedabad South">Ahmedabad South</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Prices</option>
                  <option value="low">₹0 - ₹50</option>
                  <option value="medium">₹51 - ₹80</option>
                  <option value="high">₹81+</option>
                </select>
              </div>

              {/* Venue Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Type
                </label>
                <select
                  value={filters.venueType}
                  onChange={(e) => handleFilterChange('venueType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Types</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  SEARCH
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Venues Grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading venues...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        <img
                          src={venue.image || "/placeholder.svg"}
                          alt={venue.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {venue.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          📍 {venue.location}
                        </p>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            {renderStars(venue.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({venue.rating})
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {venue.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-green-600">
                              ₹{venue.price}
                            </span>
                            <span className="text-sm text-gray-500">/hour</span>
                          </div>
                          <button
                            onClick={() => handleVenueBook(venue)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 2).map((amenity, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                          {venue.amenities.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{venue.amenities.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNumber
                              ? 'bg-teal-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}

                {filteredVenues.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your filters to see more results.</p>
                    <button
                      onClick={clearFilters}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-semibold">QuickCourt</span>
          </div>
          <p className="text-gray-300">
            © 2024 QuickCourt. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </div>
  );
}

export default VenuesPage;