import axios from 'axios';

const BASE_URL = '/api/admin/memberships';

export const fetchMemberships = () => axios.get(BASE_URL).then((res) => res.data);

export const createMembership = (membership) => axios.post(BASE_URL, membership).then((res) => res.data);

export const updateMembership = (id, membership) => axios.put(`${BASE_URL}/${id}`, membership).then((res) => res.data);

export const deleteMembership = (id) => axios.delete(`${BASE_URL}/${id}`);
