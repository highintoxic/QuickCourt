"use client";

import { useState } from "react";

function SingleVenuePage({ venue, onBookNow, onBackToVenues }) {
	const [selectedImages, setSelectedImages] = useState(0);

	const venueImages = [
		venue.image,
		"/sports-court-interior.png",
		"/sports-court-equipment.png",
		"/sports-court-facilities.png",
	];

	const timeSlots = [
		{ time: "6:00 AM", available: true },
		{ time: "7:00 AM", available: true },
		{ time: "8:00 AM", available: false },
		{ time: "9:00 AM", available: true },
		{ time: "10:00 AM", available: true },
		{ time: "11:00 AM", available: false },
		{ time: "12:00 PM", available: true },
		{ time: "1:00 PM", available: true },
		{ time: "2:00 PM", available: true },
		{ time: "3:00 PM", available: false },
		{ time: "4:00 PM", available: true },
		{ time: "5:00 PM", available: true },
		{ time: "6:00 PM", available: true },
		{ time: "7:00 PM", available: false },
		{ time: "8:00 PM", available: true },
		{ time: "9:00 PM", available: true },
	];

	return (
		<div className='min-h-screen bg-gray-50'>
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

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
					{/* Image Gallery */}
					<div>
						<div className='mb-4'>
							<img
								src={venueImages[selectedImages] || "/placeholder.svg"}
								alt={venue.name}
								className='w-full h-96 object-cover rounded-lg'
							/>
						</div>
						<div className='grid grid-cols-4 gap-2'>
							{venueImages.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImages(index)}
									className={`h-20 rounded-lg overflow-hidden ${
										selectedImages === index ? "ring-2 ring-teal-600" : ""
									}`}
								>
									<img
										src={image || "/placeholder.svg"}
										alt={`${venue.name} view ${index + 1}`}
										className='w-full h-full object-cover'
									/>
								</button>
							))}
						</div>
					</div>

					{/* Venue Details */}
					<div>
						<div className='bg-white rounded-lg shadow-sm border p-6'>
							<h1 className='text-3xl font-bold text-gray-900 mb-2'>
								{venue.name}
							</h1>
							<div className='flex items-center gap-2 mb-4'>
								<svg
									className='w-5 h-5 text-gray-400'
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
								<span className='text-gray-600'>{venue.location}</span>
							</div>

							<div className='flex items-center gap-4 mb-6'>
								<div className='flex items-center gap-1'>
									<svg
										className='w-5 h-5 text-yellow-400'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
									</svg>
									<span className='font-medium'>{venue.rating}</span>
									<span className='text-gray-600'>(124 reviews)</span>
								</div>
								<span className='text-2xl font-bold text-green-600'>
									{venue.price}
								</span>
							</div>

							{/* Amenities */}
							<div className='mb-6'>
								<h3 className='text-lg font-semibold text-gray-900 mb-3'>
									Amenities
								</h3>
								<div className='flex flex-wrap gap-2'>
									{venue.amenities?.map((amenity, index) => (
										<span
											key={index}
											className='bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm'
										>
											{amenity}
										</span>
									))}
								</div>
							</div>

							{/* Description */}
							<div className='mb-6'>
								<h3 className='text-lg font-semibold text-gray-900 mb-3'>
									About This Venue
								</h3>
								<p className='text-gray-600'>
									Experience top-quality sports facilities at {venue.name}. Our
									well-maintained courts provide the perfect environment for
									your game. Whether you're a beginner or a professional, our
									venue offers everything you need for an excellent sporting
									experience.
								</p>
							</div>

							{/* Available Time Slots */}
							<div className='mb-6'>
								<h3 className='text-lg font-semibold text-gray-900 mb-3'>
									Available Today
								</h3>
								<div className='grid grid-cols-4 gap-2'>
									{timeSlots.slice(0, 8).map((slot, index) => (
										<button
											key={index}
											disabled={!slot.available}
											className={`p-2 text-sm rounded ${
												slot.available
													? "bg-green-100 text-green-800 hover:bg-green-200"
													: "bg-gray-100 text-gray-400 cursor-not-allowed"
											}`}
										>
											{slot.time}
										</button>
									))}
								</div>
								<p className='text-sm text-gray-500 mt-2'>
									Showing 8 of{" "}
									{timeSlots.filter((slot) => slot.available).length} available
									slots
								</p>
							</div>

							<button
								onClick={onBookNow}
								className='w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200'
							>
								Book Now
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SingleVenuePage;
