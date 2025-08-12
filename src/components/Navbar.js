import React from "react";
import { useAuth } from "../contexts/AuthContext";

// Global Navbar used on all pages. Shows auth actions based on login state.
function Navbar({
	currentPage,
	onNavigate,
	onShowAuth,
	onShowLanding,
	onShowDashboard,
}) {
	const { isAuthenticated, user, logout } = useAuth();

	const navButtonBase =
		"relative px-3 py-2 text-sm font-medium transition-colors";
	const activeClasses = "text-teal-600";
	const idleClasses = "text-gray-600 hover:text-teal-600";

	const makeBtn = (label, page, extra = {}) => (
		<button
			key={page}
			type='button'
			onClick={() => onNavigate && onNavigate(page)}
			className={`${navButtonBase} ${
				currentPage === page ? activeClasses : idleClasses
			}`}
			{...extra}
		>
			{label}
			{currentPage === page && (
				<span className='absolute inset-x-2 -bottom-1 h-0.5 bg-teal-600 rounded'></span>
			)}
		</button>
	);

	return (
		<nav className='bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* Brand */}
					<button
						type='button'
						onClick={
							onShowLanding || (() => onNavigate && onNavigate("landing"))
						}
						className='flex items-center gap-2 group'
					>
						<div className='w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-inner'>
							<div className='w-4 h-4 bg-white/90 rounded-full'></div>
						</div>
						<span className='text-xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent'>
							QuickCourt
						</span>
					</button>

					{/* Primary Nav */}
					<div className='hidden md:flex items-center gap-2 ml-8'>
						{makeBtn("Home", "landing")}
						{makeBtn("Venues", "venues")}
						{isAuthenticated && makeBtn("Dashboard", "dashboard")}
					</div>

					{/* Right Actions */}
					<div className='flex items-center gap-4'>
						{!isAuthenticated && (
							<button
								type='button'
								onClick={onShowAuth}
								className='hidden sm:inline-flex bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow hover:from-teal-500 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
							>
								Sign In / Sign Up
							</button>
						)}
						{isAuthenticated && (
							<div className='flex items-center gap-3'>
								<div className='text-right hidden sm:block'>
									<p className='text-sm font-medium text-gray-800 leading-none'>
										{user?.fullName || user?.name || "User"}
									</p>
									<p className='text-xs text-gray-500 truncate max-w-[140px]'>
										{user?.email}
									</p>
								</div>
								<button
									type='button'
									onClick={
										onShowDashboard ||
										(() => onNavigate && onNavigate("dashboard"))
									}
									className='w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500'
									title='Dashboard'
								>
									{user?.fullName?.[0] || user?.name?.[0] || "U"}
								</button>
								<button
									type='button'
									onClick={logout}
									className='text-xs text-gray-500 hover:text-red-600 font-medium'
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
