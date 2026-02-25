import axiosInstance from "./axiosInstance";

const BASE_URL = "/EventBooking";

export const getAllBookings = () => axiosInstance.get(BASE_URL);

export const getMyBookings = () => axiosInstance.get(`${BASE_URL}/my-bookings`);

export const getBookingById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);

export const createBooking = (data) => axiosInstance.post(BASE_URL, data);

export const updateBooking = (id, data) => axiosInstance.patch(`${BASE_URL}/${id}`, data);

export const deleteBooking = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);
