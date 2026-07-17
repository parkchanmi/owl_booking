import axios from 'axios';

const BASE_URL = '/api/admin/centermembers';

export const fetchCenterMembers = () => axios.get(BASE_URL).then((res) => res.data);

export const createCenterMember = (centerMember) => axios.post(BASE_URL, centerMember).then((res) => res.data);

export const registerCenterMember = (payload) => axios.post(`${BASE_URL}/register`, payload).then((res) => res.data);

export const updateCenterMember = (id, centerMember) => axios.put(`${BASE_URL}/${id}`, centerMember).then((res) => res.data);

export const deleteCenterMember = (id) => axios.delete(`${BASE_URL}/${id}`);
