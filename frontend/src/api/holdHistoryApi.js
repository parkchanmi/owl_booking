import axios from 'axios';

const BASE_URL = '/api/admin/holdhistories';

export const fetchHoldHistories = (memberId) =>
    axios.get(BASE_URL, { params: { memberId } }).then((res) => res.data);

export const createHoldHistory = (payload) => axios.post(BASE_URL, payload).then((res) => res.data);

export const updateHoldHistory = (id, payload) => axios.put(`${BASE_URL}/${id}`, payload).then((res) => res.data);

export const deleteHoldHistory = (id) => axios.delete(`${BASE_URL}/${id}`);
