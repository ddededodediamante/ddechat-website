import moment from 'moment';
import config from '../config.json';

export default function Message({ data }) {
  if (!data?.author) data.author = {};
  if (!data?.author?.username && typeof data?.username === 'string') data.author['username'] = data.username;
  if (!data?.author?.userId && typeof data?.userId === 'string') data.author['userId'] = data.userId;

  let postContent = (
    <div className="vertical">
      {data?.author?.username && (
        <p className="grey">@{data.author.username}</p>
      )}
      <p className={data.spoiler === true ? 'spoiler' : ''}>{data.content ?? 'Missing content'}</p>
      <div className="horizontal" style={{ gap: '5px' }}>
        <p className="grey">{moment(data.created).fromNow()}</p>
      </div>
    </div>
  );

  return (
    <div className={`posts-post ${data?.effect}`.trim()}>
      {(data?.author?.userId !== null) && (
        <img
          alt=""
          src={`${config.apiUrl}/users/user/${data.author.userId}/avatar`}
        />
      )}

      {postContent}
    </div>
  );
}
