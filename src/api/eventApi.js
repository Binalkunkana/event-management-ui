import axiosInstance from "./axiosInstance";

const BASE_URL = "/ScheduleEvent";

export const getAllScheduledEvents = () => axiosInstance.get(BASE_URL);

// NOTE: User provided example url ends with /2, assuming it's By ID. 
// Standard REST resource/{id}
export const getScheduledEventById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);

export const createScheduledEvent = (data) => axiosInstance.post(BASE_URL, data);

export const updateScheduledEvent = (id, data) => axiosInstance.put(`${BASE_URL}/${id}`, data);

export const deleteScheduledEvent = (id) => axiosInstance.delete(`${BASE_URL}?id=${id}`);
// User specific delete format: delete:https://localhost:7187/api/ScheduleEvent?id=30

