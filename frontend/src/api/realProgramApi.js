import axios from 'axios';

const BASE_URL = '/api/realprograms';

export const fetchRealPrograms = () => axios.get(BASE_URL).then((res) => res.data);
