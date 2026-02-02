import axiosInstance from './axiosInstance';

// Assuming the backend has a specific endpoint for login. 
// If it's in the User controller: /User/login
export const loginUser = async (credentials) => {
    // credentials should be { username, password }
    const response = await axiosInstance.post('/Auth/login', credentials);
    return response.data;
};
