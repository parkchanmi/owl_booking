import axios from 'axios';

const BASE_URL = '/api/admin/instructors';

export const fetchInstructors = () => axios.get(BASE_URL).then((res) => res.data);
export const createInstructor = (data) => axios.post(BASE_URL, data).then((res) => res.data);
export const updateInstructor = (id, data) => axios.put(`${BASE_URL}/${id}`, data).then((res) => res.data);
export const deleteInstructor = (id) => axios.delete(`${BASE_URL}/${id}`);
