// Request/Response types for controllers
export interface CreateFacilityInput {
	name: string;
	description?: string;
	addressLine: string;
	city: string;
	state: string;
	pincode: string;
	phone?: string;
	email?: string;
}

export interface UpdateFacilityInput {
	name?: string;
	description?: string;
	addressLine?: string;
	city?: string;
	state?: string;
	pincode?: string;
	phone?: string;
	email?: string;
	isActive?: boolean;
}

export interface PaginationQuery {
	page?: string;
	limit?: string;
	sort?: string;
	order?: "asc" | "desc";
}

export interface FacilityQuery extends PaginationQuery {
	search?: string;
	city?: string;
	state?: string;
	status?: string;
}

export interface BookingQuery extends PaginationQuery {
	status?: string;
	courtId?: string;
	facilityId?: string;
	startDate?: string;
	endDate?: string;
}

export interface UpdateUserRoleInput {
	role: "USER" | "ADMIN" | "FACILITY_OWNER";
}

export interface UpdateBookingStatusInput {
	status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EXPIRED";
}

export interface CreateBookingInput {
	courtId: string;
	date: string;
	startTime: string;
	endTime: string;
}

export interface AvailabilityCheckInput {
	facilityId: string;
	date: string;
	startTime: string;
	endTime: string;
}

export interface UpdateFacilityStatusInput {
	status: "PENDING" | "APPROVED" | "REJECTED";
	rejectionReason?: string;
}
