import config from '../config.js';
import formatTime from "../functions/time";

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
        <img src={`${config.apiUrl}/users/${data.author.userId}/avatar`} alt="" />
      }

      {postContent}
    </div>
  );
}
