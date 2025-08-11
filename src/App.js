"use client"

import { useState } from "react"
import LandingPage from "./components/LandingPage"
import AuthPage from "./components/AuthPage"
import VenuesPage from "./components/VenuesPage"
import SingleVenuePage from "./components/SingleVenuePage"
import BookingForm from "./components/BookingForm"
import UserDashboard from "./components/UserDashboard"
import { AuthProvider } from "./contexts/AuthContext"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState("landing") // 'landing', 'auth', 'venues', 'single-venue', 'booking', 'payment', 'dashboard'
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [bookingData, setBookingData] = useState(null)
  const [user, setUser] = useState({
    name: "Mitchell Admin",
    phone: "9999999999",
    email: "mitchelladmin@gmail.com",
    avatar: "/placeholder.svg?height=80&width=80",
  })

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

  const showDashboard = () => {
    setCurrentPage("dashboard")
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
      {currentPage === "auth" && <AuthPage onBackToHome={showLandingPage} onLoginSuccess={showDashboard} />}
      {currentPage === "dashboard" && (
        <UserDashboard
          user={user}
          onUpdateUser={setUser}
          onBackToHome={showLandingPage}
          onVenuesClick={showVenuesPage}
        />
      )}
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
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  )
}

export default App
