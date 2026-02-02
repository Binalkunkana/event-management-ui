import axiosInstance from "./axiosInstance";

const PLACE_URL = "/Places";

export const getAllPlaces = () => axiosInstance.get(PLACE_URL);

export const getPlaceById = (id) =>
  axiosInstance.get(`${PLACE_URL}/${id}`);

export const createPlace = (data) =>
  axiosInstance.post(PLACE_URL, data, {
    headers: { "Content-Type": "application/json" }
  });

export const updatePlace = (id, data) =>
  axiosInstance.put(`${PLACE_URL}/${id}`, data, {
    headers: { "Content-Type": "application/json" }
  });

export const deletePlace = (id) =>
  axiosInstance.delete(`${PLACE_URL}/${id}`);



// import axiosInstance from "./axiosInstance";

// const BASE_URL = "/Places";

// export const getAllPlaces = () => axiosInstance.get(BASE_URL);

// export const getPlaceById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);

// export const createPlace = (data) => axiosInstance.post(BASE_URL, data);

// export const updatePlace = (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data);

// export const deletePlace = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);
