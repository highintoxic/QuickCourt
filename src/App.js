"use client"

import { useState } from "react"
import LandingPage from "./components/LandingPage"
import AuthPage from "./components/AuthPage"
import VenuesPage from "./components/VenuesPage"
import SingleVenuePage from "./components/SingleVenuePage"
import BookingForm from "./components/BookingForm"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("landing") // 'landing', 'auth', 'venues', 'single-venue', 'booking', 'payment'
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [bookingData, setBookingData] = useState(null)

  const showAuthPage = () => {
    setCurrentPage("auth")
  }

  const showLandingPage = () => {
    setCurrentPage("landing")
    setSelectedVenue(null)
  }

  const showVenuesPage = () => {
    setCurrentPage("venues")
  }

  const showSingleVenue = (venue) => {
    setSelectedVenue(venue)
    setCurrentPage("single-venue")
  }

  const showBookingForm = () => {
    setCurrentPage("booking")
  }

  const showPaymentConfirmation = (data) => {
    setBookingData(data)
    setCurrentPage("payment")
  }

  const backToVenues = () => {
    setCurrentPage("venues")
    setSelectedVenue(null)
  }

  const backToSingleVenue = () => {
    setCurrentPage("single-venue")
  }

  return (
    <div className="App">
      {currentPage === "landing" && <LandingPage onGetStarted={showAuthPage} onVenuesClick={showVenuesPage} />}
      {currentPage === "auth" && <AuthPage onBackToHome={showLandingPage} />}
      {currentPage === "venues" && (
        <VenuesPage onGetStarted={showAuthPage} onBackToHome={showLandingPage} onViewVenue={showSingleVenue} />
      )}
      {currentPage === "single-venue" && selectedVenue && (
        <SingleVenuePage venue={selectedVenue} onBookNow={showBookingForm} onBackToVenues={backToVenues} />
      )}
      {currentPage === "booking" && selectedVenue && (
        <BookingForm
          venue={selectedVenue}
          onContinueToPayment={showPaymentConfirmation}
          onBackToVenue={backToSingleVenue}
        />
      )}
      {currentPage === "payment" && bookingData && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
              <div className="text-left space-y-2 mb-6">
                <p>
                  <strong>Venue:</strong> {bookingData.venue.name}
                </p>
                <p>
                  <strong>Date:</strong> {bookingData.date}
                </p>
                <p>
                  <strong>Time:</strong> {bookingData.time}
                </p>
                <p>
                  <strong>Duration:</strong> {bookingData.duration} hour(s)
                </p>
                <p>
                  <strong>Court:</strong> {bookingData.court}
                </p>
                <p>
                  <strong>Total:</strong> ₹{bookingData.total}
                </p>
              </div>
              <button
                onClick={backToVenues}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Book Another Venue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App