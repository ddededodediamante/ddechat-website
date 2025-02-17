import moment from "moment";

export default function formatTime(timestamp) {
    const now = moment();
    const time = moment(timestamp);

    if (time.isSame(now, 'hour')) return time.fromNow();
    if (time.isSame(now, 'day')) return `Today at ${time.format('H:mm')}`;
    if (now.diff(time, 'days') === 1) return `Yesterday at ${time.format('H:mm')}`;
    if (time.isSame(now, 'month')) return time.format('D [at] H:mm');
    if (!time.isSame(now, 'year')) return time.format('MMMM D, YYYY [at] H:mm');

    return time.format('MMMM D, H:mm');
}