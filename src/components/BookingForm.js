"use client";

import { useState } from "react";

function BookingForm({
	venue,
	selectedTimeSlot,
	onContinueToPayment,
	onBackToVenue,
}) {
	const [bookingData, setBookingData] = useState({
		date: selectedTimeSlot?.date || "",
		time: selectedTimeSlot?.time || "",
		duration: 1,
		court: "Court 1",
		playerName: "",
		playerEmail: "",
		playerPhone: "",
	});

	const timeSlots = [
		"6:00 AM",
		"7:00 AM",
		"8:00 AM",
		"9:00 AM",
		"10:00 AM",
		"11:00 AM",
		"12:00 PM",
		"1:00 PM",
		"2:00 PM",
		"3:00 PM",
		"4:00 PM",
		"5:00 PM",
		"6:00 PM",
		"7:00 PM",
		"8:00 PM",
		"9:00 PM",
	];

	const courts = ["Court 1", "Court 2", "Court 3", "Court 4"];

	const handleInputChange = (e) => {
		setBookingData({
			...bookingData,
			[e.target.name]: e.target.value,
		});
	};

	const calculateTotal = () => {
		const basePrice = Number.parseInt(venue.price.replace(/[^0-9]/g, ""));
		return basePrice * bookingData.duration;
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const total = calculateTotal();
		onContinueToPayment({
			...bookingData,
			venue,
			total,
		});
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Back Button */}
				<button
					onClick={onBackToVenue}
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
					Back to Venue
				</button>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Booking Form */}
					<div className='bg-white rounded-lg shadow-sm border p-6'>
						<h2 className='text-2xl font-bold text-gray-900 mb-6'>
							Book Your Court
						</h2>

						<form onSubmit={handleSubmit} className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Date
									</label>
									<input
										type='date'
										name='date'
										value={bookingData.date}
										onChange={handleInputChange}
										min={new Date().toISOString().split("T")[0]}
										className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
										required
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Time
										{selectedTimeSlot && (
											<span className='ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
												Pre-selected: {selectedTimeSlot.time}
											</span>
										)}
									</label>
									<select
										name='time'
										value={bookingData.time}
										onChange={handleInputChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
										required
									>
										<option value=''>Select time</option>
										{timeSlots.map((time) => (
											<option key={time} value={time}>
												{time}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Duration (hours)
									</label>
									<select
										name='duration'
										value={bookingData.duration}
										onChange={handleInputChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
									>
										<option value={1}>1 hour</option>
										<option value={2}>2 hours</option>
										<option value={3}>3 hours</option>
										<option value={4}>4 hours</option>
									</select>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-700 mb-2'>
										Court
									</label>
									<select
										name='court'
										value={bookingData.court}
										onChange={handleInputChange}
										className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
									>
										{courts.map((court) => (
											<option key={court} value={court}>
												{court}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Player Name
								</label>
								<input
									type='text'
									name='playerName'
									value={bookingData.playerName}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
									required
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Email
								</label>
								<input
									type='email'
									name='playerEmail'
									value={bookingData.playerEmail}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
									required
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									Phone Number
								</label>
								<input
									type='tel'
									name='playerPhone'
									value={bookingData.playerPhone}
									onChange={handleInputChange}
									className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
									required
								/>
							</div>

							<button
								type='submit'
								className='w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200'
							>
								Continue to Payment
							</button>
						</form>
					</div>

					{/* Booking Summary */}
					<div className='bg-white rounded-lg shadow-sm border p-6'>
						<h3 className='text-xl font-bold text-gray-900 mb-4'>
							Booking Summary
						</h3>

						<div className='space-y-4'>
							<div className='flex items-center gap-4'>
								<img
									src={venue.image || "/placeholder.svg"}
									alt={venue.name}
									className='w-16 h-16 object-cover rounded-lg'
								/>
								<div>
									<h4 className='font-semibold text-gray-900'>{venue.name}</h4>
									<p className='text-sm text-gray-600'>{venue.location}</p>
								</div>
							</div>

							<div className='border-t pt-4 space-y-2'>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Date:</span>
									<span className='font-medium'>
										{bookingData.date || "Not selected"}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Time:</span>
									<span className='font-medium'>
										{bookingData.time || "Not selected"}
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Duration:</span>
									<span className='font-medium'>
										{bookingData.duration} hour(s)
									</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Court:</span>
									<span className='font-medium'>{bookingData.court}</span>
								</div>
							</div>

							<div className='border-t pt-4'>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Rate per hour:</span>
									<span className='font-medium'>{venue.price}</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-gray-600'>Duration:</span>
									<span className='font-medium'>
										{bookingData.duration} hour(s)
									</span>
								</div>
								<div className='flex justify-between text-lg font-bold border-t pt-2 mt-2'>
									<span>Total:</span>
									<span className='text-green-600'>₹{calculateTotal()}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BookingForm;
