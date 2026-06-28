import axios from 'axios';

const BASE_URL = '/api/admin/instructors';

export const fetchInstructors = () => axios.get(BASE_URL).then((res) => res.data);
