import moment from 'moment';
import config from '../config.json';

function formatTime(timestamp) {
  const now = moment();
  const yesterday = moment().subtract(1, 'day');
  const time = moment(timestamp);

  if (time.isSame(now, 'hour')) return time.fromNow();
  if (time.isSame(now, 'day')) return `Today at ${time.format('H:mm')}`;
  if (time.isSame(yesterday, 'day')) return `Yesterday at ${time.format('H:mm')}`;
  if (!time.isSame(now, 'year')) return time.format('MMMM D, YYYY [at] H:mm');

  return time.format('MMMM D [at] H:mm');
}

export default function Message({ data }) {
  if (!data?.author) data.author = {};
  if (!data?.author?.username && typeof data?.username === 'string') data.author['username'] = data.username;
  if (!data?.author?.userId && typeof data?.userId === 'string') data.author['userId'] = data.userId;

  let postContent = (
    <div className="vertical">
      {data?.author?.username && (
        <p className="grey">@{data.author.username}</p>
      )}
      <p className={data.spoiler && 'spoiler'}>{data.content ?? 'Missing content'}</p>
      <div className="horizontal" style={{ gap: '5px' }}>
        <p className="grey">{formatTime(data.created)}</p>
      </div>
    </div>
  );

  return (
    <div className={`posts-post ${data?.effect}`.trim()}>
      {(data?.author?.userId !== null) &&
        <img src={`${config.apiUrl}/users/user/${data.author.userId}/avatar`} alt="" />
      }

      {postContent}
    </div>
  );
}
