import axios from 'axios';

const BASE_URL = '/api/attendance';

export const fetchMemberBookingAttendanceHistories = (memberId, centerId) =>
    axios.get(`${BASE_URL}/member/${memberId}`, { params: { centerId } }).then((res) => res.data);
