

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import VenuesPage from "./pages/VenuesPage";
import SingleVenuePage from "./pages/SingleVenuePage";
import BookingForm from "./components/BookingForm";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/Navbar";
import "./App.css";

// Inner component that can use AuthContext
function AppContent() {
	const { user: authUser, loading, isAuthenticated } = useAuth();
	const [currentPage, setCurrentPage] = useState("landing"); // 'landing', 'auth', 'venues', 'single-venue', 'booking', 'payment', 'dashboard'
	const [selectedVenue, setSelectedVenue] = useState(null);
	const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
	const [bookingData, setBookingData] = useState(null);

	// Auto-redirect authenticated users from auth page
	useEffect(() => {
		if (isAuthenticated && currentPage === 'auth') {
			setCurrentPage('dashboard');
		}
	}, [isAuthenticated, currentPage]);

	const showAuthPage = () => {
		setCurrentPage("auth");
	};

	const showLandingPage = () => {
		setCurrentPage("landing");
		setSelectedVenue(null);
	};

	const showVenuesPage = () => {
		setCurrentPage("venues");
	};

	const showDashboard = () => {
		setCurrentPage("dashboard");
	};

	const showSingleVenue = (venue) => {
		setSelectedVenue(venue);
		setCurrentPage("single-venue");
	};

	const showBookingForm = (timeSlot) => {
		setSelectedTimeSlot(timeSlot);
		setCurrentPage("booking");
	};

	const showPaymentConfirmation = (data) => {
		setBookingData(data);
		setCurrentPage("payment");
	};

	const backToVenues = () => {
		setCurrentPage("venues");
		setSelectedVenue(null);
		setSelectedTimeSlot(null);
	};

	const backToSingleVenue = () => {
		setCurrentPage("single-venue");
		setSelectedTimeSlot(null);
	};

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4'></div>
					<p className='text-teal-700 font-medium'>Loading QuickCourt...</p>
				</div>
			</div>
		);
	}

	return (
		<div className='App'>
			<Navbar
				currentPage={currentPage}
				onNavigate={(page) => {
					switch (page) {
						case "landing":
							showLandingPage();
							break;
						case "venues":
							showVenuesPage();
							break;
						case "dashboard":
							showDashboard();
							break;
						default:
							break;
					}
				}}
				onShowAuth={showAuthPage}
				onShowDashboard={showDashboard}
				onShowLanding={showLandingPage}
				user={authUser}
			/>

			{currentPage === "landing" && (
				<LandingPage
					onGetStarted={showAuthPage}
					onVenuesClick={showVenuesPage}
				/>
			)}
			{currentPage === "auth" && (
				<AuthPage
					onBackToHome={showLandingPage}
					onLoginSuccess={showDashboard}
				/>
			)}
			{currentPage === "dashboard" && (
				<UserDashboard
					onBackToHome={showLandingPage}
					onVenuesClick={showVenuesPage}
				/>
			)}
			{currentPage === "venues" && (
				<VenuesPage
					onGetStarted={showAuthPage}
					onBackToHome={showLandingPage}
					onViewVenue={showSingleVenue}
				/>
			)}
			{currentPage === "single-venue" && selectedVenue && (
				<SingleVenuePage
					venue={selectedVenue}
					onBookNow={showBookingForm}
					onBackToVenues={backToVenues}
				/>
			)}
			{currentPage === "booking" && selectedVenue && (
				<BookingForm
					venue={selectedVenue}
					selectedTimeSlot={selectedTimeSlot}
					onContinueToPayment={showPaymentConfirmation}
					onBackToVenue={backToSingleVenue}
				/>
			)}
			{currentPage === "payment" && bookingData && (
				<BookingConfirmationPage
					bookingData={bookingData}
					onBackToVenues={backToVenues}
					onViewBookingDetails={() => {
						// Could navigate to a detailed booking management page
						console.log('View booking details:', bookingData);
					}}
				/>
			)}
		</div>
	);
}

// Main App component that provides AuthContext
function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}


export default App;
