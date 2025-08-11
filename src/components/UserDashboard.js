"use client";

import { useState } from "react";

function UserDashboard({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' or 'profile'
  const [bookingFilter, setBookingFilter] = useState("all"); // 'all', 'confirmed', 'cancelled'

  // Sample user data
  const userData = {
    name: "Mitchell Admin",
    phone: "9999999999",
    email: "mitchellAdmin@gmail.com",
  };

  const [bookings, setBookings] = useState([
    {
      id: 1,
      venue: "Skyline Badminton Court (Badminton)",
      date: "18 June 2024",
      timeSlot: "5:00 PM - 6:00 PM",
      subject: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "Court Booking",
      action: "Write Review",
    },
    {
      id: 2,
      venue: "Skyline Badminton Court (Badminton)",
      date: "19 June 2024",
      timeSlot: "5:00 PM - 6:00 PM",
      subject: "Rajkot, Gujarat",
      status: "Confirmed",
      type: "Court Booking",
      action: "Write Review",
    },
  ]);

  const handleCancelBooking = (bookingId) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "Cancelled" } : booking
      )
    );
  };

  const getFilteredBookings = () => {
    if (bookingFilter === "confirmed") {
      return bookings.filter((booking) => booking.status === "Confirmed");
    } else if (bookingFilter === "cancelled") {
      return bookings.filter((booking) => booking.status === "Cancelled");
    }
    return bookings; // 'all' case
  };

  const getBookingCounts = () => {
    const confirmed = bookings.filter((booking) => booking.status === "Confirmed").length;
    const cancelled = bookings.filter((booking) => booking.status === "Cancelled").length;
    return { confirmed, cancelled, total: bookings.length };
  };

  const [profileData, setProfileData] = useState({
    fullName: userData.name,
    email: userData.email,
    oldPassword: "",
    newPassword: "",
  });

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving profile data:", profileData);
    // Add save logic here
  };

  const handleReset = () => {
    setProfileData({
      fullName: userData.name,
      email: userData.email,
      oldPassword: "",
      newPassword: "",
    });
  };

  const filteredBookings = getFilteredBookings();
  const counts = getBookingCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-semibold text-gray-800">
                QUICKCOURT
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="text-gray-700 hover:text-teal-600 font-medium"
              >
                Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mitchell Admin</span>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Profile Page
        </h1>

        <div className="flex gap-6">
          {/* Left Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-800">{userData.name}</h3>
              <p className="text-sm text-gray-600">{userData.phone}</p>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === "bookings"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                All Bookings
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            {activeTab === "bookings" && (
              <div>
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      All Bookings
                    </h2>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setBookingFilter("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingFilter === "all"
                          ? "bg-teal-100 text-teal-700 border border-teal-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({counts.total})
                    </button>
                    <button
                      onClick={() => setBookingFilter("confirmed")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingFilter === "confirmed"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Confirmed ({counts.confirmed})
                    </button>
                    <button
                      onClick={() => setBookingFilter("cancelled")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bookingFilter === "cancelled"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Cancelled ({counts.cancelled})
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`border rounded-lg p-4 ${
                            booking.status === "Cancelled"
                              ? "bg-red-50 border-red-200"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-600">📅</span>
                                <h3 className="font-medium text-gray-800">
                                  {booking.venue}
                                </h3>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  📅 {booking.date} ⏰ {booking.timeSlot}
                                </p>
                                <p>📍 {booking.subject}</p>
                                <p>
                                  Status:{" "}
                                  <span
                                    className={`font-medium ${
                                      booking.status === "Cancelled"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {booking.status}
                                  </span>
                                </p>
                              </div>
                              <div className="mt-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  [{booking.type}] [{booking.action}]
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {booking.status === "Confirmed" ? (
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="px-3 py-1 text-sm text-gray-500">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {bookingFilter === "confirmed" &&
                            "No confirmed bookings found."}
                          {bookingFilter === "cancelled" &&
                            "No cancelled bookings found."}
                          {bookingFilter === "all" && "No bookings found."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                      No cancel booking button for past dates
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Profile Page
                  </h2>
                </div>

                <div className="p-6">
                  <div className="max-w-md mx-auto">
                    <div className="text-center mb-6">
                      <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) =>
                            handleProfileChange("fullName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            handleProfileChange("email", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Old Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={profileData.oldPassword}
                            onChange={(e) =>
                              handleProfileChange("oldPassword", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            👁
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={profileData.newPassword}
                            onChange={(e) =>
                              handleProfileChange("newPassword", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            👁
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={handleReset}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Reset
                        </button>
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
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
