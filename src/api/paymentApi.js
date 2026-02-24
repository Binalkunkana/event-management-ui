import axiosInstance from "./axiosInstance";
import axios from "axios";

const BASE_URL = "/Payment";

export const getAllPayments = () => axiosInstance.get(BASE_URL);

export const getPaymentById = (id) => axiosInstance.get(`${BASE_URL}/${id}`);

export const processPayment = (data) => {
  return axiosInstance.post(BASE_URL, data);
};

export const makePayment = (data) => {
  return axiosInstance.post(`${BASE_URL}/make-payment`, data);
};

export const updatePayment = (id, data) => {
  return axiosInstance.patch(`${BASE_URL}/${id}`, data);
};

export const deletePayment = (id) => axiosInstance.delete(`${BASE_URL}/${id}`);
