import axiosInstance from "./axiosInstance";

// Base URL is already set in axiosInstance as /api
// So we just need /User endpoint
// The original was https://localhost:7187/api/User
// axiosInstance has baseURL: "https://localhost:7187/api"

const USER_URL = "/User";

export const getAllUsers = () => axiosInstance.get(USER_URL);

export const getUserById = (id) =>
  axiosInstance.get(`${USER_URL}/${id}`);

export const createUser = (data) =>
  axiosInstance.post(USER_URL, data);

export const updateUser = (id, data) =>
  axiosInstance.put(`${USER_URL}/${id}`, data);

export const deleteUser = async (id) => {
  // Try standard DELETE first
  try {
    return await axiosInstance.delete(`${USER_URL}/${id}`);
  } catch (error) {
    // If 405 error, try query parameter format (like ScheduleEvent)
    if (error.response?.status === 405) {
      try {
        return await axiosInstance.delete(`${USER_URL}?id=${id}`);
      } catch (queryError) {
        // If that fails, try POST to delete endpoint (common .NET pattern)
        try {
          return await axiosInstance.post(`${USER_URL}/Delete/${id}`);
        } catch (postError) {
          // If all fail, try POST with id in body
          return await axiosInstance.post(`${USER_URL}/Delete`, { id });
        }
      }
    }
    throw error;
  }
};
