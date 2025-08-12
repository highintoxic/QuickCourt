import { useState, useEffect } from "react";
import { facilityService, courtService } from "../services";

function VenuesPage({ onGetStarted, onBackToHome, onViewVenue }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [facilities, setFacilities] = useState([]);
	const [sports, setSports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Load facilities and sports on component mount
	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError(null);

			try {
				// Load facilities and sports in parallel
				const [facilitiesResult, sportsResult] = await Promise.all([
					facilityService.getAllFacilities({
						status: "APPROVED",
						sortBy: "ratingAvg",
						sortOrder: "desc",
					}),
					courtService.getAllSports(),
				]);

				if (facilitiesResult.success) {
					setFacilities(facilitiesResult.data);
				} else {
					console.error("Failed to load facilities:", facilitiesResult.message);
				}

				if (sportsResult.success) {
					setSports(sportsResult.data);
				} else {
					console.error("Failed to load sports:", sportsResult.message);
				}
			} catch (err) {
				console.error("Error loading data:", err);
				setError("Failed to load venues. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	// Create categories from sports data
	const categories = [
		{ id: "all", name: "All Sports" },
		...sports.map((sport) => ({
			id: sport.id,
			name: sport.name,
		})),
	];

	// Filter facilities based on search and category
	const filteredFacilities = facilities.filter((facility) => {
		const matchesSearch =
			facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			facility.addressLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
			facility.city.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesCategory =
			selectedCategory === "all" ||
			facility.courts?.some((court) => court.sportId === selectedCategory);

		return matchesSearch && matchesCategory;
	});

	// Helper function to get venue location string
	const getVenueLocation = (facility) => {
		return `${facility.addressLine}, ${facility.city}, ${facility.state}`;
	};

	// Helper function to get cheapest court price
	const getCheapestPrice = (facility) => {
		if (!facility.courts || facility.courts.length === 0) return "N/A";
		const cheapest = Math.min(
			...facility.courts.map((court) => parseFloat(court.pricePerHour))
		);
		return `₹${cheapest}/hour`;
	};

	// Helper function to get primary image
	const getPrimaryImage = (facility) => {
		if (facility.photos && facility.photos.length > 0) {
			return facility.photos.sort((a, b) => a.sortOrder - b.sortOrder)[0].url;
		}
		return "/placeholder.svg?height=200&width=300";
	};

	return (
		<div className='min-h-screen bg-gray-50 pt-4'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-gray-900 mb-4'>
						Find Your Perfect Court
					</h1>

					{/* Search and Filter */}
					<div className='flex flex-col md:flex-row gap-4 mb-6'>
						<div className='flex-1'>
							<input
								type='text'
								placeholder='Search venues or locations...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
							/>
						</div>
						<div className='md:w-64'>
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent'
							>
								{categories.map((category) => (
									<option key={category.id} value={category.id}>
										{category.name}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className='flex justify-center items-center py-12'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600'></div>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
						<p className='text-red-600'>{error}</p>
						<button
							onClick={() => window.location.reload()}
							className='mt-2 text-red-700 underline hover:no-underline'
						>
							Retry
						</button>
					</div>
				)}

				{/* Venues Grid */}
				{!loading && !error && (
					<>
						<div className='mb-4'>
							<p className='text-gray-600'>
								{filteredFacilities.length} venue
								{filteredFacilities.length !== 1 ? "s" : ""} found
							</p>
						</div>

						{filteredFacilities.length === 0 && !loading && (
							<div className='text-center py-12'>
								<p className='text-gray-500 text-lg'>
									No venues found matching your criteria.
								</p>
								<p className='text-gray-400'>
									Try adjusting your search or filters.
								</p>
							</div>
						)}

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredFacilities.map((facility) => (
								<div
									key={facility.id}
									className='bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer'
									onClick={() => onViewVenue(facility)}
								>
									<div className='h-48 overflow-hidden'>
										<img
											src={getPrimaryImage(facility)}
											alt={facility.name}
											className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
										/>
									</div>
									<div className='p-6'>
										<div className='flex justify-between items-start mb-2'>
											<h3 className='text-xl font-semibold text-gray-900 truncate'>
												{facility.name}
											</h3>
											<div className='flex items-center'>
												<svg
													className='w-4 h-4 text-yellow-400 mr-1'
													fill='currentColor'
													viewBox='0 0 20 20'
												>
													<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
												</svg>
												<span className='text-sm font-medium text-gray-600'>
													{facility.ratingAvg
														? facility.ratingAvg.toFixed(1)
														: "New"}
												</span>
												{facility.ratingCount > 0 && (
													<span className='text-xs text-gray-400 ml-1'>
														({facility.ratingCount})
													</span>
												)}
											</div>
										</div>
										<p className='text-gray-600 text-sm mb-3 line-clamp-2'>
											{getVenueLocation(facility)}
										</p>
										<div className='flex justify-between items-center mb-4'>
											<span className='text-2xl font-bold text-teal-600'>
												{getCheapestPrice(facility)}
											</span>
											<span className='text-sm text-gray-500'>
												{facility.courts?.length || 0} court
												{facility.courts?.length !== 1 ? "s" : ""}
											</span>
										</div>
										{facility.amenities && facility.amenities.length > 0 && (
											<div className='flex flex-wrap gap-1 mb-4'>
												{facility.amenities.slice(0, 3).map((amenity) => (
													<span
														key={amenity.id || amenity.amenityName}
														className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
													>
														{amenity.amenityName || amenity}
													</span>
												))}
												{facility.amenities.length > 3 && (
													<span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
														+{facility.amenities.length - 3} more
													</span>
												)}
											</div>
										)}
										<button
											onClick={(e) => {
												e.stopPropagation();
												onViewVenue(facility);
											}}
											className='w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
										>
											View Details
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default VenuesPage;
