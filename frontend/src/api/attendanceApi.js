import axios from 'axios';

const BASE_URL = '/api/attendance';

export const fetchAttendance = (realProgramId) =>
    axios.get(`${BASE_URL}/${realProgramId}`).then((res) => res.data);

export const fetchMemberBookingAttendanceHistories = (memberId, centerId) =>
    axios.get(`${BASE_URL}/member/${memberId}`, { params: { centerId } }).then((res) => res.data);
