"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { bookingService } from "../services";

function UserDashboard({ onBackToHome, onVenuesClick }) {
	const { user: authUser, updateUser } = useAuth();
	const [activeSection, setActiveSection] = useState("bookings");
	const [isEditing, setIsEditing] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		fullName: authUser?.fullName || authUser?.name || "",
		email: authUser?.email || "",
		oldPassword: "",
		newPassword: "",
	});

	// Load user bookings when component mounts or active section changes
	useEffect(() => {
		if (activeSection === "bookings") {
			loadBookings();
		}
	}, [activeSection]);

	// Update formData when authUser changes
	useEffect(() => {
		if (authUser) {
			setFormData(prev => ({
				...prev,
				fullName: authUser?.fullName || authUser?.name || "",
				email: authUser?.email || "",
			}));
		}
	}, [authUser]);

	const loadBookings = async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await bookingService.getUserBookings({
				sortBy: 'createdAt',
				sortOrder: 'desc'
			});

			if (result.success) {
				setBookings(result.data);
			} else {
				setError(result.message || 'Failed to load bookings');
			}
		} catch (err) {
			console.error('Error loading bookings:', err);
			setError('Failed to load bookings. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const formatBookingDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-IN', { 
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const formatBookingTime = (startsAt, endsAt) => {
		const start = new Date(startsAt);
		const end = new Date(endsAt);
		return `${start.toLocaleTimeString('en-IN', { 
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})} - ${end.toLocaleTimeString('en-IN', { 
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		})}`;
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'CONFIRMED':
				return 'bg-green-100 text-green-800';
			case 'PENDING':
				return 'bg-yellow-100 text-yellow-800';
			case 'CANCELLED':
				return 'bg-red-100 text-red-800';
			case 'COMPLETED':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSaveProfile = () => {
		// onUpdateUser({
		// 	...user,
		// 	name: formData.fullName,
		// 	email: formData.email,
		// });
		setIsEditing(false);
		// Reset password fields
		setFormData({
			...formData,
			oldPassword: "",
			newPassword: "",
		});
	};

	const handleReset = () => {
		setFormData({
			fullName: user.name,
			email: user.email,
			oldPassword: "",
			newPassword: "",
		});
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<h1 className='text-2xl font-bold text-gray-900 mb-8'>Profile Page</h1>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
					{/* Left Sidebar - Profile */}
					<div className='lg:col-span-1'>
						<div className='bg-white rounded-lg shadow-sm border p-6'>
							{/* Profile Section */}
							<div className='text-center mb-6'>
								<div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center'>
									<svg
										className='w-10 h-10 text-gray-400'
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
								<h3 className='font-semibold text-gray-900'>{user.name}</h3>
								<p className='text-sm text-gray-600'>{user.phone}</p>
								<p className='text-sm text-gray-600'>{user.email}</p>
							</div>

							<button
								onClick={() => setIsEditing(!isEditing)}
								className='w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 mb-4'
							>
								Edit Profile
							</button>

							{/* Navigation Menu */}
							<div className='space-y-2'>
								<button
									onClick={() => setActiveSection("bookings")}
									className={`w-full text-left py-2 px-4 rounded-lg ${
										activeSection === "bookings"
											? "bg-green-100 text-green-700 font-medium"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									All Bookings
								</button>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div className='lg:col-span-2'>
						{activeSection === "bookings" && !isEditing && (
							<div className='bg-white rounded-lg shadow-sm border'>
								{/* Bookings Header */}
								<div className='p-6 border-b'>
									<div className='flex items-center justify-between'>
										<h2 className='text-lg font-semibold text-gray-900'>
											All Bookings
										</h2>
										<button className='text-gray-400 hover:text-gray-600'>
											<span className='text-sm'>Cancelled</span>
										</button>
									</div>
								</div>

								{/* Bookings List */}
								<div className='p-6'>
									{loading && (
										<div className="flex justify-center items-center py-12">
											<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
										</div>
									)}

									{error && (
										<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
											<p className="text-red-600">{error}</p>
											<button 
												onClick={loadBookings}
												className="mt-2 text-red-700 underline hover:no-underline"
											>
												Try Again
											</button>
										</div>
									)}

									{!loading && !error && bookings.length > 0 ? (
										<div className='space-y-4'>
											{bookings.map((booking) => (
												<div key={booking.id} className='border rounded-lg p-4'>
													<div className='flex items-start justify-between'>
														<div className='flex-1'>
															<div className='flex items-center gap-2 mb-2'>
																<span className='text-sm text-blue-600'>
																	📅
																</span>
																<span className='text-sm font-medium'>
																	{booking.court?.facility?.name} ({booking.court?.sport?.name})
																</span>
															</div>
															<div className='text-sm text-gray-600 space-y-1'>
																<p>
																	📅 {formatBookingDate(booking.startsAt)} ⏰ {formatBookingTime(booking.startsAt, booking.endsAt)}
																</p>
																<p>📍 {booking.court?.facility?.city}, {booking.court?.facility?.state}</p>
																<p>🏟️ Court: {booking.court?.name}</p>
																<p>💰 Amount: ₹{booking.totalAmount}</p>
																<div className='flex items-center gap-2'>
																	<span>Status:</span>
																	<span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
																		{booking.status}
																	</span>
																</div>
																<div className='flex items-center gap-2'>
																	<span>Payment:</span>
																	<span className={`px-2 py-1 rounded text-xs font-medium ${
																		booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
																		booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
																		'bg-red-100 text-red-800'
																	}`}>
																		{booking.paymentStatus}
																	</span>
																</div>
															</div>
														</div>
														<div className='text-right'>
															{booking.status === 'CONFIRMED' && new Date(booking.startsAt) > new Date() && (
																<button className='text-red-600 text-sm hover:underline mb-2 block'>
																	Cancel Booking
																</button>
															)}
															{booking.status === 'COMPLETED' && (
																<button className='text-blue-600 text-sm hover:underline'>
																	Write Review
																</button>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									) : !loading && !error && (
										<div className='text-center py-12'>
											<div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
												<svg
													className='w-8 h-8 text-gray-400'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-1a4 4 0 014-4h4a4 4 0 014 4v1a4 4 0 11-8 0z'
													/>
												</svg>
											</div>
											<p className='text-gray-500 mb-2'>
												No bookings found
											</p>
											<p className='text-gray-400 mb-4'>
												Start by booking your first venue!
											</p>
											<button
												onClick={onVenuesClick}
												className='bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors'
											>
												Browse Venues
											</button>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Profile Edit Form */}
						{isEditing && (
							<div className='bg-white rounded-lg shadow-sm border p-6'>
								<h2 className='text-lg font-semibold text-gray-900 mb-6'>
									Edit Profile
								</h2>

								<div className='space-y-4'>
									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Full Name
										</label>
										<input
											type='text'
											name='fullName'
											value={formData.fullName}
											onChange={handleInputChange}
											className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Email
										</label>
										<input
											type='email'
											name='email'
											value={formData.email}
											onChange={handleInputChange}
											className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
										/>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											Old Password
										</label>
										<div className='relative'>
											<input
												type='password'
												name='oldPassword'
												value={formData.oldPassword}
												onChange={handleInputChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
											/>
											<button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
												👁
											</button>
										</div>
									</div>

									<div>
										<label className='block text-sm font-medium text-gray-700 mb-2'>
											New Password
										</label>
										<div className='relative'>
											<input
												type='password'
												name='newPassword'
												value={formData.newPassword}
												onChange={handleInputChange}
												className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500'
											/>
											<button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'>
												👁
											</button>
										</div>
									</div>

									<div className='flex gap-4 pt-4'>
										<button
											onClick={handleReset}
											className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50'
										>
											Reset
										</button>
										<button
											onClick={handleSaveProfile}
											className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
										>
											Save
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserDashboard;
