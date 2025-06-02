import formatTime from "../functions/time";
import config from '../config.js';
import { Link } from 'react-router-dom';
import markdownit from 'markdown-it';

export default function Post({ data, noSocial = false }) {
  let hasReplies = data?.replies !== null && data?.replies?.length !== null;

  if ((!data.author || !data.author.username) && typeof data.username === 'string') {
    data.author = {
      username: data.username,
    };
  }

  let content = (
    <div className="vertical">
      {data?.author?.username && (
        <p className="grey">@{data.author.username}</p>
      )}
      <p style={{ color: 'var(--font)' }} dangerouslySetInnerHTML={{ __html: markdownit().renderInline(data.content ?? 'Missing content') }} />
      <div className="horizontal" style={{ gap: '5px' }}>
        {noSocial === false && (
          <p className="grey">{data?.likes?.length ?? 0} likes ·</p>
        )}
        <p className="grey">{formatTime(data.created)}</p>
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
            src={`${config.apiUrl}/users/${data.author.id}/avatar`}
          />
        </Link>
      )}

      {noSocial === false ? <Link to={'/post?id=' + data.id}>{content}</Link> : content}
    </div>
  );
}
