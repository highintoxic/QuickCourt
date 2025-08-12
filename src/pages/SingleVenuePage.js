"use client";

import { useState, useEffect } from "react";
import { courtService } from "../services";

function SingleVenuePage({ venue, onBookNow, onBackToVenues }) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);
	const [courts, setCourts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [timeSlots, setTimeSlots] = useState([]);
	const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

	// Get all images (venue photos + fallback images)
	const allImages = [
		...(venue.photos && venue.photos.length > 0
			? venue.photos
					.sort((a, b) => a.sortOrder - b.sortOrder)
					.map((photo) => photo.url)
			: ["/placeholder.svg?height=400&width=600"]),
		"/sports-court-interior.png",
		"/sports-court-equipment.png",
		"/sports-court-facilities.png",
	].filter((img, index, arr) => arr.indexOf(img) === index); // Remove duplicates

	// Load courts when component mounts or venue changes
	useEffect(() => {
		if (venue && venue.id) {
			loadCourts();
		}
	}, [venue]);

	// Load availability when date changes
	useEffect(() => {
		if (courts.length > 0 && selectedDate) {
			loadTimeSlots();
		}
	}, [courts, selectedDate]);

	const loadCourts = async () => {
		setLoading(true);
		try {
			const result = await courtService.getCourtsByFacility(venue.id);
			if (result.success) {
				setCourts(result.data);
			} else {
				console.error("Failed to load courts:", result.message);
			}
		} catch (error) {
			console.error("Error loading courts:", error);
		} finally {
			setLoading(false);
		}
	};

	const loadTimeSlots = async () => {
		if (!courts.length || !selectedDate) return;

		setTimeSlotsLoading(true);
		setSelectedTimeSlot(null); // Reset selected time slot when loading new slots
		try {
			// Get availability for the first court (you could modify this to show all courts or let user select)
			const firstCourt = courts[0];
			const availabilityResult = await courtService.getCourtAvailability(
				firstCourt.id,
				{ date: selectedDate }
			);

			if (availabilityResult.success && availabilityResult.data.timeSlots) {
				// Convert the API time slots to the format expected by the UI
				const slots = availabilityResult.data.timeSlots.map((slot) => {
					const startTime = new Date(slot.startTime);
					const hour24 = startTime.getHours();
					const minute = startTime.getMinutes();

					// Format time for display
					let time12;
					const timeString =
						minute === 0
							? `${hour24}:00`
							: `${hour24}:${minute.toString().padStart(2, "0")}`;

					if (hour24 === 0) {
						time12 =
							minute === 0
								? "12:00 AM"
								: `12:${minute.toString().padStart(2, "0")} AM`;
					} else if (hour24 === 12) {
						time12 =
							minute === 0
								? "12:00 PM"
								: `12:${minute.toString().padStart(2, "0")} PM`;
					} else if (hour24 < 12) {
						time12 =
							minute === 0
								? `${hour24}:00 AM`
								: `${hour24}:${minute.toString().padStart(2, "0")} AM`;
					} else {
						const displayHour = hour24 - 12;
						time12 =
							minute === 0
								? `${displayHour}:00 PM`
								: `${displayHour}:${minute.toString().padStart(2, "0")} PM`;
					}

					return {
						time: time12,
						hour24: hour24,
						minute: minute,
						available: slot.available,
						startTime: slot.startTime,
						endTime: slot.endTime,
					};
				});

				setTimeSlots(slots);
			} else {
				console.error(
					"Failed to load availability:",
					availabilityResult.message
				);
				// Fallback to empty slots
				setTimeSlots([]);
			}
		} catch (error) {
			console.error("Error loading time slots:", error);
			// Fallback to empty slots
			setTimeSlots([]);
		} finally {
			setTimeSlotsLoading(false);
		}
	};

	// Helper functions
	const getVenueLocation = () => {
		return `${venue.addressLine}, ${venue.city}, ${venue.state} ${venue.pincode}`;
	};

	const getCheapestPrice = () => {
		if (!courts || courts.length === 0) return "Contact for price";
		const cheapest = Math.min(
			...courts.map((court) => parseFloat(court.pricePerHour))
		);
		return `₹${cheapest}/hour`;
	};

	const getCourtTypes = () => {
		if (!courts || courts.length === 0) return [];
		const sportNames = [
			...new Set(courts.map((court) => court.sport?.name).filter(Boolean)),
		];
		return sportNames;
	};

	const handleTimeSlotSelect = (slot) => {
		if (slot.available) {
			setSelectedTimeSlot(slot);
		}
	};

	const handleBookNow = () => {
		if (selectedTimeSlot && courts.length > 0) {
			// Pass the selected venue, court, date, and time slot to the booking form
			onBookNow({
				venue,
				court: courts[0], // Using first court, could be modified to let user select
				selectedDate,
				selectedTimeSlot,
			});
		} else {
			// If no time slot selected, just proceed to booking form
			onBookNow();
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 pt-4'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Back Button */}
				<button
					onClick={onBackToVenues}
					className='flex items-center text-gray-600 hover:text-teal-600 mb-6 transition-colors'
				>
					<svg
						className='w-5 h-5 mr-2'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M15 19l-7-7 7-7'
						/>
					</svg>
					Back to Venues
				</button>

				<div className='bg-white rounded-xl shadow-lg overflow-hidden'>
					{/* Image Gallery */}
					<div className='flex flex-col lg:flex-row'>
						<div className='lg:w-2/3'>
							<div className='h-96 overflow-hidden'>
								<img
									src={allImages[selectedImageIndex]}
									alt={venue.name}
									className='w-full h-full object-cover'
								/>
							</div>
							{/* Thumbnail Gallery */}
							{allImages.length > 1 && (
								<div className='flex gap-2 p-4 overflow-x-auto'>
									{allImages.map((image, index) => (
										<img
											key={index}
											src={image}
											alt={`${venue.name} ${index + 1}`}
											className={`w-20 h-16 object-cover rounded-lg cursor-pointer transition-all ${
												selectedImageIndex === index
													? "ring-2 ring-teal-500 opacity-100"
													: "opacity-70 hover:opacity-100"
											}`}
											onClick={() => setSelectedImageIndex(index)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Venue Details */}
						<div className='lg:w-1/3 p-6'>
							<h1 className='text-3xl font-bold text-gray-900 mb-2'>
								{venue.name}
							</h1>
							<div className='flex items-center mb-4'>
								<svg
									className='w-5 h-5 text-gray-400 mr-2'
									fill='currentColor'
									viewBox='0 0 20 20'
								>
									<path
										fillRule='evenodd'
										d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
										clipRule='evenodd'
									/>
								</svg>
								<span className='text-gray-600 text-sm'>
									{getVenueLocation()}
								</span>
							</div>

							{venue.ratingAvg && (
								<div className='flex items-center mb-4'>
									<div className='flex'>
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-5 h-5 ${
													i < Math.floor(venue.ratingAvg)
														? "text-yellow-400"
														: "text-gray-300"
												}`}
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
											</svg>
										))}
									</div>
									<span className='ml-2 text-sm text-gray-600'>
										{venue.ratingAvg.toFixed(1)} ({venue.ratingCount} reviews)
									</span>
								</div>
							)}

							<div className='mb-6'>
								<h3 className='text-xl font-semibold text-gray-900 mb-3'>
									Starting from
								</h3>
								<p className='text-3xl font-bold text-teal-600'>
									{getCheapestPrice()}
								</p>
								<p className='text-sm text-gray-500 mt-1'>
									{courts.length} court{courts.length !== 1 ? "s" : ""}{" "}
									available
								</p>
							</div>

							{/* Court Types */}
							{getCourtTypes().length > 0 && (
								<div className='mb-6'>
									<h3 className='text-lg font-semibold text-gray-900 mb-3'>
										Available Sports
									</h3>
									<div className='flex flex-wrap gap-2'>
										{getCourtTypes().map((sport, index) => (
											<span
												key={index}
												className='px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full'
											>
												{sport}
											</span>
										))}
									</div>
								</div>
							)}

							{/* Amenities */}
							{venue.amenities && venue.amenities.length > 0 && (
								<div className='mb-6'>
									<h3 className='text-lg font-semibold text-gray-900 mb-3'>
										Amenities
									</h3>
									<div className='grid grid-cols-2 gap-2'>
										{venue.amenities.map((amenity, index) => (
											<div key={index} className='flex items-center'>
												<svg
													className='w-4 h-4 text-green-500 mr-2'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M5 13l4 4L19 7'
													/>
												</svg>
												<span className='text-sm text-gray-600'>
													{amenity.amenityName || amenity}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							<button
								onClick={handleBookNow}
								disabled={loading || courts.length === 0}
								className={`w-full font-medium py-3 px-6 rounded-lg transition-colors ${
									loading || courts.length === 0
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: selectedTimeSlot
										? "bg-green-600 hover:bg-green-700 text-white"
										: "bg-teal-600 hover:bg-teal-700 text-white"
								}`}
							>
								{loading
									? "Loading..."
									: courts.length === 0
									? "No Courts Available"
									: selectedTimeSlot
									? `Book ${selectedTimeSlot.time} Slot`
									: "Book Now"}
							</button>
						</div>
					</div>

					{/* Description */}
					{venue.description && (
						<div className='border-t p-6'>
							<h3 className='text-xl font-semibold text-gray-900 mb-3'>
								About This Venue
							</h3>
							<p className='text-gray-600 leading-relaxed'>
								{venue.description}
							</p>
						</div>
					)}

					{/* Time Slots */}
					<div className='border-t p-6'>
						<h3 className='text-xl font-semibold text-gray-900 mb-4'>
							Available Time Slots
							{courts.length > 0 && (
								<span className='text-sm font-normal text-gray-500 ml-2'>
									for {courts[0].name}
								</span>
							)}
						</h3>

						{/* Date Picker */}
						<div className='mb-4'>
							<label className='block text-sm font-medium text-gray-700 mb-2'>
								Select Date
							</label>
							<input
								type='date'
								value={selectedDate}
								onChange={(e) => setSelectedDate(e.target.value)}
								min={new Date().toISOString().split("T")[0]}
								className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
							/>
						</div>

						{/* Loading for main courts data */}
						{loading && (
							<div className='flex justify-center py-4'>
								<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600'></div>
							</div>
						)}

						{/* Loading for time slots */}
						{!loading && timeSlotsLoading && (
							<div className='flex justify-center items-center py-4'>
								<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2'></div>
								<span className='text-gray-600'>Loading availability...</span>
							</div>
						)}

						{/* Time slots grid */}
						{!loading && !timeSlotsLoading && timeSlots.length > 0 && (
							<div>
								<div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
									{timeSlots.map((slot, index) => (
										<button
											key={index}
											disabled={!slot.available}
											onClick={() => handleTimeSlotSelect(slot)}
											className={`py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
												selectedTimeSlot?.startTime === slot.startTime
													? "bg-green-500 text-white ring-2 ring-green-300 transform scale-105"
													: slot.available
													? "bg-teal-100 text-teal-700 hover:bg-teal-200 hover:scale-105"
													: "bg-gray-100 text-gray-400 cursor-not-allowed"
											}`}
											title={
												selectedTimeSlot?.startTime === slot.startTime
													? `Selected: ${slot.time}`
													: slot.available 
													? `Available: ${slot.time}` 
													: `Booked: ${slot.time}`
											}
										>
											{slot.time}
											{selectedTimeSlot?.startTime === slot.startTime && (
												<svg className='w-3 h-3 ml-1 inline' fill='currentColor' viewBox='0 0 20 20'>
													<path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
												</svg>
											)}
										</button>
									))}
								</div>
								<div className='flex justify-between items-center text-xs text-gray-500 mt-3'>
									<span>
										{timeSlots.filter((slot) => slot.available).length} of{" "}
										{timeSlots.length} slots available
									</span>
									{selectedTimeSlot && (
										<span className='text-green-600 font-medium'>
											✓ {selectedTimeSlot.time} selected
										</span>
									)}
								</div>
							</div>
						)}

						{/* No slots available */}
						{!loading &&
							!timeSlotsLoading &&
							timeSlots.length === 0 &&
							courts.length > 0 && (
								<p className='text-gray-500 text-center py-4'>
									No time slots available for the selected date.
								</p>
							)}

						{/* No courts available */}
						{!loading && courts.length === 0 && (
							<p className='text-gray-500 text-center py-4'>
								No courts available at this venue.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default SingleVenuePage;
