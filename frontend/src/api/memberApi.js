import axios from 'axios';

const BASE_URL = '/api/member';

export const fetchMembers = () => axios.get(BASE_URL).then((res) => res.data);

export const fetchMemberById = (id) => axios.get(`${BASE_URL}/${id}`).then((res) => res.data);

export const updateMemberContact = (id, payload) => axios.put(`${BASE_URL}/${id}/contact`, payload).then((res) => res.data);
