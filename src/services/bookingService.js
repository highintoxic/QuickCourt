import api from "../utils/api";

class BookingService {
	// Create new booking (authenticated)
	async createBooking(bookingData) {
		try {
			const response = await api.post("/bookings", bookingData);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to create booking",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get user's bookings (authenticated)
	async getUserBookings(params = {}) {
		try {
			const queryParams = new URLSearchParams();

			if (params.page) queryParams.append("page", params.page);
			if (params.limit) queryParams.append("limit", params.limit);
			if (params.status) queryParams.append("status", params.status);
			if (params.upcoming !== undefined)
				queryParams.append("upcoming", params.upcoming);

			const queryString = queryParams.toString();
			const url = queryString
				? `/bookings/my-bookings?${queryString}`
				: "/bookings/my-bookings";

			const response = await api.get(url);
			return {
				success: true,
				data: response.data.data,
				pagination: response.data.pagination,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to fetch your bookings",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Check availability for courts (public)
	async checkAvailability(params) {
		try {
			const queryParams = new URLSearchParams();

			// Required parameters
			queryParams.append("facilityId", params.facilityId);
			queryParams.append("date", params.date);

			// Optional parameters
			if (params.sportId) queryParams.append("sportId", params.sportId);
			if (params.startTime) queryParams.append("startTime", params.startTime);
			if (params.endTime) queryParams.append("endTime", params.endTime);

			const response = await api.get(
				`/bookings/availability?${queryParams.toString()}`
			);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to check availability",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get booking by ID (authenticated)
	async getBookingById(bookingId) {
		try {
			const response = await api.get(`/bookings/${bookingId}`);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to fetch booking details",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Update booking status (facility owners and admins)
	async updateBookingStatus(bookingId, status) {
		try {
			const response = await api.patch(`/bookings/${bookingId}/status`, {
				status,
			});
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to update booking status",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Cancel booking (authenticated)
	async cancelBooking(bookingId, reason = "") {
		try {
			const response = await api.patch(`/bookings/${bookingId}/cancel`, {
				reason,
			});
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to cancel booking",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get facility bookings (facility owners and admins)
	async getFacilityBookings(facilityId, params = {}) {
		try {
			const queryParams = new URLSearchParams();

			if (params.page) queryParams.append("page", params.page);
			if (params.limit) queryParams.append("limit", params.limit);
			if (params.status) queryParams.append("status", params.status);
			if (params.date) queryParams.append("date", params.date);
			if (params.courtId) queryParams.append("courtId", params.courtId);

			const queryString = queryParams.toString();
			const url = queryString
				? `/bookings/facility/${facilityId}?${queryString}`
				: `/bookings/facility/${facilityId}`;

			const response = await api.get(url);
			return {
				success: true,
				data: response.data.data,
				pagination: response.data.pagination,
				summary: response.data.summary,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to fetch facility bookings",
				errors: error.response?.data?.errors || [],
			};
		}
	}
}

// Export singleton instance
export default new BookingService();
