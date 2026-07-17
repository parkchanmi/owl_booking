import axios from 'axios';

const BASE_URL = '/api/admin/membermemberships';

export const fetchMemberMemberships = (memberId) =>
    axios.get(BASE_URL, { params: { memberId } }).then((res) => res.data);

export const createMemberMembership = (payload) => axios.post(BASE_URL, payload).then((res) => res.data);

export const updateMemberMembership = (id, payload) =>
    axios.put(`${BASE_URL}/${id}`, payload).then((res) => res.data);
