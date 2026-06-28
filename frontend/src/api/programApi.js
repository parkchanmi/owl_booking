import axios from 'axios';

const BASE_URL = '/api/admin/programs';

export const fetchPrograms = () => axios.get(BASE_URL).then((res) => res.data);

export const createProgram = (program) => axios.post(BASE_URL, program).then((res) => res.data);

export const updateProgram = (id, program) => axios.put(`${BASE_URL}/${id}`, program).then((res) => res.data);

export const deleteProgram = (id) => axios.delete(`${BASE_URL}/${id}`);
