import { useState, useEffect } from "react";

function BookingConfirmationPage({
	bookingData,
	onBackToVenues,
	onViewBookingDetails,
}) {
	const [showAnimation, setShowAnimation] = useState(false);

	useEffect(() => {
		// Trigger animation after component mounts
		setShowAnimation(true);
	}, []);

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatTime = (timeString) => {
		return timeString;
	};

	const generateBookingId = () => {
		return `QC${Date.now().toString().slice(-6)}`;
	};

	const bookingId = generateBookingId();

	return (
		<div className='min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-3xl mx-auto'>
				{/* Success Animation */}
				<div
					className={`text-center mb-8 transition-all duration-1000 ${
						showAnimation
							? "transform translate-y-0 opacity-100"
							: "transform -translate-y-10 opacity-0"
					}`}
				>
					<div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative'>
						<svg
							className='w-12 h-12 text-green-600'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={3}
								d='M5 13l4 4L19 7'
							/>
						</svg>
						{/* Animated ring */}
						<div className='absolute inset-0 rounded-full border-4 border-green-200 animate-ping'></div>
					</div>
					<h1 className='text-4xl font-bold text-gray-900 mb-2'>
						Booking Confirmed! 🎉
					</h1>
					<p className='text-lg text-gray-600'>
						Your court has been successfully reserved
					</p>
				</div>

				{/* Booking Details Card */}
				<div className='bg-white rounded-2xl shadow-xl overflow-hidden mb-8'>
					{/* Header */}
					<div className='bg-gradient-to-r from-teal-600 to-blue-600 px-8 py-6'>
						<h2 className='text-2xl font-bold text-white mb-2'>
							Booking Details
						</h2>
						<p className='text-teal-100'>Booking ID: #{bookingId}</p>
					</div>

					{/* Venue Information */}
					<div className='p-8'>
						<div className='flex items-start space-x-6 mb-8'>
							<div className='flex-shrink-0'>
								<img
									src={
										bookingData.venue?.image ||
										"/placeholder.svg?height=120&width=120"
									}
									alt={bookingData.venue?.name}
									className='w-20 h-20 rounded-lg object-cover'
								/>
							</div>
							<div className='flex-1'>
								<h3 className='text-2xl font-bold text-gray-900 mb-2'>
									{bookingData.venue?.name}
								</h3>
								<div className='flex items-center text-gray-600 mb-2'>
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
											d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
										/>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
										/>
									</svg>
									{bookingData.venue?.location}
								</div>
								<div className='flex items-center'>
									<div className='flex items-center mr-4'>
										<svg
											className='w-4 h-4 text-yellow-400 mr-1'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
										</svg>
										<span className='text-sm font-medium text-gray-600'>
											{bookingData.venue?.rating}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Booking Information Grid */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
							<div className='space-y-6'>
								<div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
									<div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-blue-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6a2 2 0 012 2v1a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2z'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>DATE</p>
										<p className='text-lg font-semibold text-gray-900'>
											{formatDate(bookingData.date)}
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
									<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-green-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>TIME</p>
										<p className='text-lg font-semibold text-gray-900'>
											{formatTime(bookingData.time)}
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
									<div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-purple-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>COURT</p>
										<p className='text-lg font-semibold text-gray-900'>
											{bookingData.court}
										</p>
									</div>
								</div>
							</div>

							<div className='space-y-6'>
								<div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
									<div className='w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-orange-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>
											DURATION
										</p>
										<p className='text-lg font-semibold text-gray-900'>
											{bookingData.duration} hour
											{bookingData.duration > 1 ? "s" : ""}
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 bg-gray-50 rounded-lg'>
									<div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-red-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>PLAYER</p>
										<p className='text-lg font-semibold text-gray-900'>
											{bookingData.playerName}
										</p>
										<p className='text-sm text-gray-600'>
											{bookingData.playerEmail}
										</p>
									</div>
								</div>

								<div className='flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200'>
									<div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
										<svg
											className='w-6 h-6 text-green-600'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
											/>
										</svg>
									</div>
									<div>
										<p className='text-sm text-gray-500 font-medium'>
											TOTAL AMOUNT
										</p>
										<p className='text-2xl font-bold text-green-600'>
											₹{bookingData.total}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Payment Status */}
						<div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-8'>
							<div className='flex items-center'>
								<div className='flex-shrink-0'>
									<svg
										className='w-6 h-6 text-green-600'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
										/>
									</svg>
								</div>
								<div className='ml-3'>
									<h3 className='text-sm font-medium text-green-800'>
										Payment Confirmed
									</h3>
									<p className='text-sm text-green-700'>
										Your payment has been processed successfully
									</p>
								</div>
							</div>
						</div>

						{/* Important Instructions */}
						<div className='bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8'>
							<h3 className='text-lg font-semibold text-blue-900 mb-4 flex items-center'>
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
										d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
								Important Instructions
							</h3>
							<ul className='text-blue-800 space-y-2'>
								<li className='flex items-start'>
									<span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
									Please arrive 15 minutes before your scheduled time
								</li>
								<li className='flex items-start'>
									<span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
									Bring valid ID proof and this booking confirmation
								</li>
								<li className='flex items-start'>
									<span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
									Cancellation allowed up to 2 hours before booking time
								</li>
								<li className='flex items-start'>
									<span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0'></span>
									Contact venue directly for any queries:{" "}
									{bookingData.venue?.phone || "+91 98765 43210"}
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
					<button
						onClick={onBackToVenues}
						className='w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center'
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
								d='M12 6v6m0 0v6m0-6h6m-6 0H6'
							/>
						</svg>
						Book Another Venue
					</button>

					<button
						onClick={() => window.print()}
						className='w-full sm:w-auto px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center'
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
								d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
							/>
						</svg>
						Print Receipt
					</button>

					<button
						onClick={() => {
							const message = `🎉 Booking Confirmed!\n\nVenue: ${
								bookingData.venue?.name
							}\nDate: ${formatDate(bookingData.date)}\nTime: ${formatTime(
								bookingData.time
							)}\nCourt: ${
								bookingData.court
							}\nBooking ID: #${bookingId}\nTotal: ₹${bookingData.total}`;
							navigator.share
								? navigator.share({
										title: "Booking Confirmation",
										text: message,
								  })
								: navigator.clipboard.writeText(message);
						}}
						className='w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center'
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
								d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
							/>
						</svg>
						Share
					</button>
				</div>
			</div>
		</div>
	);
}

export default BookingConfirmationPage;
