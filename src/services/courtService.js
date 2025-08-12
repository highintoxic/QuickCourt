import api from "../utils/api";

class CourtService {
	// Get courts by facility ID (public)
	async getCourtsByFacility(facilityId, params = {}) {
		try {
			const queryParams = new URLSearchParams();

			if (params.sportId) queryParams.append("sportId", params.sportId);
			if (params.isActive !== undefined)
				queryParams.append("isActive", params.isActive);

			const queryString = queryParams.toString();
			const url = queryString
				? `/courts/facility/${facilityId}?${queryString}`
				: `/courts/facility/${facilityId}`;

			const response = await api.get(url);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to fetch courts",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get court by ID (public)
	async getCourtById(courtId) {
		try {
			const response = await api.get(`/courts/${courtId}`);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to fetch court details",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get court availability (public)
	async getCourtAvailability(courtId, params) {
		try {
			const queryParams = new URLSearchParams();

			// Required date parameter
			queryParams.append("date", params.date);

			// Optional parameters
			if (params.startTime) queryParams.append("startTime", params.startTime);
			if (params.endTime) queryParams.append("endTime", params.endTime);

			const response = await api.get(
				`/courts/${courtId}/availability?${queryParams.toString()}`
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
					error.response?.data?.message || "Failed to check court availability",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get all sports (public)
	async getAllSports() {
		try {
			const response = await api.get("/courts/sports");
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to fetch sports",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Create court (authenticated - facility owners only)
	async createCourt(facilityId, courtData) {
		try {
			const response = await api.post(
				`/courts/facility/${facilityId}`,
				courtData
			);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to create court",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Update court (authenticated - facility owners only)
	async updateCourt(courtId, courtData) {
		try {
			const response = await api.put(`/courts/${courtId}`, courtData);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to update court",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Delete court (authenticated - facility owners only)
	async deleteCourt(courtId) {
		try {
			const response = await api.delete(`/courts/${courtId}`);
			return {
				success: true,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to delete court",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Set court unavailability (authenticated - facility owners only)
	async setCourtUnavailability(courtId, unavailabilityData) {
		try {
			const response = await api.post(
				`/courts/${courtId}/unavailability`,
				unavailabilityData
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
					error.response?.data?.message || "Failed to set court unavailability",
				errors: error.response?.data?.errors || [],
			};
		}
	}
}

// Export singleton instance
const courtService = new CourtService();
export default courtService;
