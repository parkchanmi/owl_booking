import axios from 'axios';

const BASE_URL = '/api/admin/center-configs';

export const fetchCenterConfig = (centerId) => axios.get(`${BASE_URL}/${centerId}`).then((res) => res.data);

export const updateCenterConfig = (centerId, config) =>
    axios.put(`${BASE_URL}/${centerId}`, config).then((res) => res.data);
