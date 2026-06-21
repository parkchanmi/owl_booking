import axios from 'axios';

const BASE_URL = '/api/centers';

export const fetchCenters = () => axios.get(BASE_URL).then((res) => res.data);

export const createCenter = (center) => axios.post(BASE_URL, center).then((res) => res.data);

export const updateCenter = (id, center) => axios.put(`${BASE_URL}/${id}`, center).then((res) => res.data);

export const deleteCenter = (id) => axios.delete(`${BASE_URL}/${id}`);
