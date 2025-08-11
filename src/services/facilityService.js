import api from "../utils/api";

class FacilityService {
	// Get all approved facilities (public)
	async getAllFacilities(params = {}) {
		try {
			const queryParams = new URLSearchParams();

			// Add pagination parameters
			if (params.page) queryParams.append("page", params.page);
			if (params.limit) queryParams.append("limit", params.limit);

			// Add search parameters
			if (params.search) queryParams.append("search", params.search);
			if (params.city) queryParams.append("city", params.city);
			if (params.state) queryParams.append("state", params.state);
			if (params.sportId) queryParams.append("sportId", params.sportId);
			if (params.venueType) queryParams.append("venueType", params.venueType);
			if (params.minRating) queryParams.append("minRating", params.minRating);

			// Add sorting parameters
			if (params.sortBy) queryParams.append("sortBy", params.sortBy);
			if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

			const queryString = queryParams.toString();
			const url = queryString ? `/facilities?${queryString}` : "/facilities";

			const response = await api.get(url);
			return {
				success: true,
				data: response.data.data,
				pagination: response.data.pagination,
				filters: response.data.filters,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to fetch facilities",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get facility by ID (public)
	async getFacilityById(facilityId) {
		try {
			const response = await api.get(`/facilities/${facilityId}`);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message:
					error.response?.data?.message || "Failed to fetch facility details",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Create new facility (authenticated - facility owners and admins)
	async createFacility(facilityData) {
		try {
			const response = await api.post("/facilities", facilityData);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to create facility",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Get user's facilities (authenticated - facility owners and admins)
	async getUserFacilities(params = {}) {
		try {
			const queryParams = new URLSearchParams();

			if (params.page) queryParams.append("page", params.page);
			if (params.limit) queryParams.append("limit", params.limit);
			if (params.status) queryParams.append("status", params.status);
			if (params.isActive !== undefined)
				queryParams.append("isActive", params.isActive);

			const queryString = queryParams.toString();
			const url = queryString
				? `/facilities/my/facilities?${queryString}`
				: "/facilities/my/facilities";

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
					error.response?.data?.message || "Failed to fetch your facilities",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Update facility (authenticated - facility owners and admins)
	async updateFacility(facilityId, updateData) {
		try {
			const response = await api.patch(`/facilities/${facilityId}`, updateData);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to update facility",
				errors: error.response?.data?.errors || [],
			};
		}
	}

	// Delete facility (authenticated - facility owners and admins)
	async deleteFacility(facilityId) {
		try {
			const response = await api.delete(`/facilities/${facilityId}`);
			return {
				success: true,
				message: response.data.message,
			};
		} catch (error) {
			return {
				success: false,
				message: error.response?.data?.message || "Failed to delete facility",
				errors: error.response?.data?.errors || [],
			};
		}
	}
}

// Export singleton instance
export default new FacilityService();
