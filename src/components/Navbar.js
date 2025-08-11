import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = ({
	currentPage,
	onNavigate,
	onShowAuth,
	onShowDashboard,
	onShowLanding,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, logout, isAuthenticated } = useAuth();

	const handleLogout = () => {
		logout();
		onShowLanding();
		setIsMobileMenuOpen(false);
	};

	const handleNavigation = (page) => {
		onNavigate(page);
		setIsMobileMenuOpen(false);
	};

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<nav className='bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* Logo */}
					<div className='flex items-center'>
						<button
							onClick={() => handleNavigation("landing")}
							className='flex items-center gap-2 hover:opacity-80 transition-opacity'
						>
							<div className='w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center'>
								<div className='w-4 h-4 bg-white rounded-full'></div>
							</div>
							<span className='text-xl font-semibold text-gray-800'>
								QuickCourt
							</span>
						</button>
					</div>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-8'>
						<button
							onClick={() => handleNavigation("landing")}
							className={`text-sm font-medium transition-colors ${
								currentPage === "landing"
									? "text-teal-600 border-b-2 border-teal-600 pb-1"
									: "text-gray-700 hover:text-teal-600"
							}`}
						>
							Home
						</button>

						<button
							onClick={() => handleNavigation("venues")}
							className={`text-sm font-medium transition-colors ${
								currentPage === "venues" || currentPage === "single-venue"
									? "text-teal-600 border-b-2 border-teal-600 pb-1"
									: "text-gray-700 hover:text-teal-600"
							}`}
						>
							Find Courts
						</button>

						{isAuthenticated && (
							<button
								onClick={() => handleNavigation("dashboard")}
								className={`text-sm font-medium transition-colors ${
									currentPage === "dashboard"
										? "text-teal-600 border-b-2 border-teal-600 pb-1"
										: "text-gray-700 hover:text-teal-600"
								}`}
							>
								Dashboard
							</button>
						)}

						<div className='border-l border-gray-300 h-6'></div>

						{isAuthenticated ? (
							<div className='flex items-center space-x-4'>
								<div className='flex items-center space-x-2'>
									<div className='w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center'>
										<span className='text-teal-600 text-sm font-medium'>
											{user?.fullName?.charAt(0) ||
												user?.name?.charAt(0) ||
												"U"}
										</span>
									</div>
									<div className='text-sm'>
										<p className='text-gray-800 font-medium'>
											{user?.fullName || user?.name || "User"}
										</p>
										<p className='text-gray-500 text-xs'>
											{user?.role || "USER"}
										</p>
									</div>
								</div>

								<button
									onClick={handleLogout}
									className='text-sm text-gray-600 hover:text-red-600 font-medium transition-colors'
								>
									Logout
								</button>
							</div>
						) : (
							<div className='flex items-center space-x-4'>
								<button
									onClick={onShowAuth}
									className='bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors'
								>
									Sign In
								</button>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className='md:hidden'>
						<button
							onClick={toggleMobileMenu}
							className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 transition-colors'
						>
							<span className='sr-only'>Open main menu</span>
							{!isMobileMenuOpen ? (
								<svg
									className='h-6 w-6'
									stroke='currentColor'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
							) : (
								<svg
									className='h-6 w-6'
									stroke='currentColor'
									fill='none'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{isMobileMenuOpen && (
				<div className='md:hidden'>
					<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200'>
						<button
							onClick={() => handleNavigation("landing")}
							className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
								currentPage === "landing"
									? "bg-teal-50 text-teal-600"
									: "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
							}`}
						>
							Home
						</button>

						<button
							onClick={() => handleNavigation("venues")}
							className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
								currentPage === "venues" || currentPage === "single-venue"
									? "bg-teal-50 text-teal-600"
									: "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
							}`}
						>
							Find Courts
						</button>

						{isAuthenticated && (
							<button
								onClick={() => handleNavigation("dashboard")}
								className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
									currentPage === "dashboard"
										? "bg-teal-50 text-teal-600"
										: "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
								}`}
							>
								Dashboard
							</button>
						)}

						<div className='border-t border-gray-200 pt-3 mt-3'>
							{isAuthenticated ? (
								<div className='space-y-3'>
									<div className='flex items-center px-3'>
										<div className='w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center'>
											<span className='text-teal-600 text-sm font-medium'>
												{user?.fullName?.charAt(0) ||
													user?.name?.charAt(0) ||
													"U"}
											</span>
										</div>
										<div className='ml-3'>
											<p className='text-base font-medium text-gray-800'>
												{user?.fullName || user?.name || "User"}
											</p>
											<p className='text-sm text-gray-500'>
												{user?.email || ""}
											</p>
										</div>
									</div>

									<button
										onClick={handleLogout}
										className='block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors'
									>
										Logout
									</button>
								</div>
							) : (
								<div className='space-y-2'>
									<button
										onClick={onShowAuth}
										className='block w-full mx-3 bg-teal-600 hover:bg-teal-700 text-white text-base font-medium px-4 py-2 rounded-lg transition-colors'
									>
										Sign In
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
