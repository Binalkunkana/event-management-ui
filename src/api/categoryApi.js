import axiosInstance from "./axiosInstance";

const CATEGORY_URL = "/EventCategory";

export const getAllCategories = () => axiosInstance.get(CATEGORY_URL);

export const getCategoryById = (id) =>
  axiosInstance.get(`${CATEGORY_URL}/${id}`);

export const createCategory = (data) =>
  axiosInstance.post(CATEGORY_URL, data, {
    headers: { "Content-Type": "application/json" }
  });

export const updateCategory = (id, data) =>
  axiosInstance.patch(`${CATEGORY_URL}/${id}`, data, {
    headers: { "Content-Type": "application/json" }
  });

export const deleteCategory = (id) =>
  axiosInstance.delete(`${CATEGORY_URL}/${id}`);

// import axiosInstance from "./axiosInstance";

// const CATEGORY_URL = "/EventCategory";

// export const getAllCategories = () => axiosInstance.get(CATEGORY_URL);

// export const getCategoryById = (id) =>
//   axiosInstance.get(`${CATEGORY_URL}/${id}`);

// export const createCategory = (data) =>
//   axiosInstance.post(CATEGORY_URL, data);


// export const updateCategory = async (id, data) => {
//   try {
//     return await axiosInstance.patch(`${CATEGORY_URL}/${id}`, data);
//   } catch (error) {
//     // If 405 or 404, try sending id in body (same logic as User API style)
//     if (error.response?.status === 405 || error.response?.status === 404) {
//       try {
//         return await axiosInstance.patch(CATEGORY_URL, {
//           ...data,
//           eventCategoryId: id,
//           EventCategoryId: id
//         });
//       } catch (innerError) {
//         throw innerError;
//       }
//     }
//     throw error;
//   }
// };

// export const deleteCategory = async (id) => {
//   try {
//     // Normal DELETE: /EventCategory/{id}
//     return await axiosInstance.delete(`${CATEGORY_URL}/${id}`);
//   } catch (error) {
//     // If 405, try query string
//     if (error.response?.status === 405) {
//       try {
//         return await axiosInstance.delete(`${CATEGORY_URL}?id=${id}`);
//       } catch (queryError) {
//         // If still fails, try POST delete pattern
//         try {
//           return await axiosInstance.post(`${CATEGORY_URL}/Delete/${id}`);
//         } catch (postError) {
//           // Final fallback: POST with id in body
//           return await axiosInstance.post(`${CATEGORY_URL}/Delete`, { id });
//         }
//       }
//     }
//     throw error;
//   }
// };
