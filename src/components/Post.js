import moment from 'moment';
import config from '../config.json';
import { Link } from 'react-router-dom';

export default function Post({ data, noSocial = false }) {
  let hasReplies = data?.replies !== null && data?.replies?.length !== null;

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
      <p style={{ color: '#fff' }}>{data.content ?? 'Missing content'}</p>
      <div className="horizontal" style={{ gap: '5px' }}>
        {noSocial === false && (
          <p className="grey">{data?.likes?.length ?? 0} likes ·</p>
        )}
        <p className="grey">{moment(data.created).fromNow()}</p>
        {noSocial === false && hasReplies && (
          <p className="grey">· {data?.replies?.length ?? 0} replies</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="posts-post">
      {data?.author?.id && (
        <Link to={`/user?id=${data.author.id}`}>
          <img
            alt=""
            src={`${config.apiUrl}/users/user/${data.author.id}/avatar`}
          />
        </Link>
      )}

      {noSocial === false ? (
        <Link to={'/post?id=' + data.id}>{postContent}</Link>
      ) : (
        postContent
      )}
    </div>
  );
}
