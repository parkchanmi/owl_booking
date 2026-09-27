import axios from 'axios';

export const fetchSalesReport = (params) =>
    axios.get('/api/admin/sales', { params }).then((res) => res.data);
