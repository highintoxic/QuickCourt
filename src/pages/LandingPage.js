"use client";

import { useState, useEffect } from "react";
import { facilityService } from "../services";

function LandingPage({ onGetStarted, onVenuesClick }) {
	const [selectedVenue, setSelectedVenue] = useState(null);
	const [featuredVenues, setFeaturedVenues] = useState([]);
	const [loading, setLoading] = useState(true);

	// Load featured venues on component mount
	useEffect(() => {
		const loadFeaturedVenues = async () => {
			try {
				const result = await facilityService.getAllFacilities({
					limit: 6,
					sortBy: "ratingAvg",
					sortOrder: "desc",
					status: "APPROVED",
				});

				if (result.success) {
					setFeaturedVenues(result.data);
				}
			} catch (error) {
				console.error("Error loading featured venues:", error);
			} finally {
				setLoading(false);
			}
		};

		loadFeaturedVenues();
	}, []);

	// Helper functions
	const getPrimaryImage = (facility) => {
		if (facility.photos && facility.photos.length > 0) {
			return facility.photos.sort((a, b) => a.sortOrder - b.sortOrder)[0].url;
		}
		return "/placeholder.svg?height=200&width=300";
	};

	const getVenueLocation = (facility) => {
		return `${facility.city}, ${facility.state}`;
	};

	const getCheapestPrice = (facility) => {
		if (!facility.courts || facility.courts.length === 0)
			return "Contact for price";
		const cheapest = Math.min(
			...facility.courts.map((court) => parseFloat(court.pricePerHour))
		);
		return `₹${cheapest}/hour`;
	};

	const handleBookNow = () => {
		onGetStarted(); // This will take them to signup/login
	};

	const handleVenueSelect = (venue) => {
		setSelectedVenue(venue);
		console.log("Selected venue:", venue);
		onGetStarted(); // Take them to signup/login to book
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Hero Section (add top padding for sticky navbar) */}
			<section className='bg-white pt-28 pb-20'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
					<h1 className='text-4xl md:text-6xl font-bold text-green-600 mb-4'>
						Step Up to the Game
					</h1>
					<p className='text-2xl md:text-3xl text-gray-800 mb-8'>
						We'll Handle the Rest
					</p>
					<div className='space-x-4'>
						<button
							onClick={handleBookNow}
							className='bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200'
						>
							Book Now
						</button>
						<button
							onClick={onVenuesClick}
							className='bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200'
						>
							Browse Venues
						</button>
					</div>
				</div>
			</section>

			{/* Venue Booking Section */}
			<section
				className='py-20 bg-cover bg-center relative'
				style={{
					backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
				}}
			>
				<div className='absolute inset-0 bg-black/40'></div>
				<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<h2 className='text-3xl md:text-4xl font-bold text-white text-center mb-12'>
						Book The Venue
					</h2>

					{loading && (
						<div className='flex justify-center items-center py-12'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white'></div>
						</div>
					)}

					{!loading && featuredVenues.length > 0 && (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{featuredVenues.map((facility) => (
								<div
									key={facility.id}
									className='bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105'
									onClick={() => handleVenueSelect(facility)}
								>
									<div className='h-48 bg-gray-200 overflow-hidden'>
										<img
											src={getPrimaryImage(facility)}
											alt={facility.name}
											className='w-full h-full object-cover'
										/>
									</div>
									<div className='p-4'>
										<h3 className='text-lg font-semibold text-gray-800 mb-2'>
											{facility.name}
										</h3>
										<p className='text-sm text-gray-600 mb-2'>
											{getVenueLocation(facility)}
										</p>
										<div className='flex justify-between items-center'>
											<span className='text-lg font-bold text-green-600'>
												{getCheapestPrice(facility)}
											</span>
											<div className='flex items-center'>
												{facility.ratingAvg && (
													<>
														<svg
															className='w-4 h-4 text-yellow-400 mr-1'
															fill='currentColor'
															viewBox='0 0 20 20'
														>
															<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
														</svg>
														<span className='text-sm text-gray-600'>
															{facility.ratingAvg.toFixed(1)}
														</span>
													</>
												)}
											</div>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleVenueSelect(facility);
											}}
											className='mt-3 w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm transition-colors duration-200'
										>
											Book Now
										</button>
									</div>
								</div>
							))}
						</div>
					)}

					{!loading && featuredVenues.length === 0 && (
						<div className='text-center py-12'>
							<p className='text-white/80 text-lg'>
								No venues available at the moment.
							</p>
							<button
								onClick={onVenuesClick}
								className='mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'
							>
								Explore All Venues →
							</button>
						</div>
					)}

					<div className='text-center mt-8'>
						<button
							onClick={onVenuesClick}
							className='bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200'
						>
							View All Venues →
						</button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='bg-gray-800 text-white py-12'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
						{/* Company Info */}
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className='w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center'>
									<div className='w-4 h-4 bg-white rounded-full'></div>
								</div>
								<span className='text-xl font-semibold'>QuickCourt</span>
							</div>
							<p className='text-gray-300 mb-4'>
								Your Local Sports, Just a Click Away
							</p>
							<div className='flex space-x-4'>
								<a href='#' className='text-gray-300 hover:text-white'>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
									</svg>
								</a>
								<a href='#' className='text-gray-300 hover:text-white'>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z' />
									</svg>
								</a>
								<a href='#' className='text-gray-300 hover:text-white'>
									<svg
										className='w-5 h-5'
										fill='currentColor'
										viewBox='0 0 24 24'
									>
										<path d='M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z' />
									</svg>
								</a>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
							<ul className='space-y-2'>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										About Us
									</a>
								</li>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Services
									</a>
								</li>
								<li>
									<button
										onClick={onVenuesClick}
										className='text-gray-300 hover:text-white'
									>
										Venues
									</button>
								</li>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Contact
									</a>
								</li>
							</ul>
						</div>

						{/* Services */}
						<div>
							<h3 className='text-lg font-semibold mb-4'>Services</h3>
							<ul className='space-y-2'>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Court Booking
									</a>
								</li>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Equipment Rental
									</a>
								</li>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Coaching
									</a>
								</li>
								<li>
									<a href='#' className='text-gray-300 hover:text-white'>
										Tournaments
									</a>
								</li>
							</ul>
						</div>

						{/* Contact Info */}
						<div>
							<h3 className='text-lg font-semibold mb-4'>Contact Info</h3>
							<div className='space-y-2 text-gray-300'>
								<p>📍 123 Sports Avenue</p>
								<p>📞 (555) 123-4567</p>
								<p>✉ info@quickcourt.com</p>
								<p>🕒 Mon-Sun: 6AM-10PM</p>
							</div>
						</div>
					</div>

					<div className='border-t border-gray-700 mt-8 pt-8 text-center'>
						<p className='text-gray-300'>
							© 2024 QuickCourt. All rights reserved. | Privacy Policy | Terms
							of Service
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default LandingPage;
