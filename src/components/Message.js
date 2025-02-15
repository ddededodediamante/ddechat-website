import moment from 'moment';
import config from '../config.json';

export default function Message({ data }) {
  if ((!data.author || !data.author.username) && typeof data.username === 'string') {
    data.author = {
      username: data.username,
    };
  }

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
      {data?.author?.username && (
        <img
          alt=""
          src={`${config.apiUrl}/users/user/${data.author.username}/avatar`}
        />
      )}

      {postContent}
    </div>
  );
}
