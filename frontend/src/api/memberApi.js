import axios from 'axios';

const BASE_URL = '/api/member';

export const fetchMembers = () => axios.get(BASE_URL).then((res) => res.data);

export const fetchMemberById = (id) => axios.get(`${BASE_URL}/${id}`).then((res) => res.data);
