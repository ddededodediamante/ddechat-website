import formatTime from "../functions/time.js";
import config from "../config.js";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from "./Loading.jsx";
import cache, { fetchPostCached, fetchUserCached } from "../cache.ts";
import markdown from "../functions/Markdown.js";

export default function Post({ data, noSocial = false, showParentPost = false, style }) {
  const [parentPost, setParentPost] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);
  const [author, setAuthor] = useState(data?.author ?? null);
  const [loadingAuthor, setLoadingAuthor] = useState(false);

  if (
    data &&
    (!data.author || !data.author.username) &&
    typeof data.username === "string"
  ) {
    data.author = {
      username: data.username,
    };
  }

  useEffect(() => {
    if (!cache?.users) cache.users = {};

    const authorId = data?.authorId ?? data?.author?.id;
    if (!authorId) return;

    if (data?.author?.username) {
      setAuthor(data.author);
      return;
    }

    setLoadingAuthor(true);
    fetchUserCached(authorId, config.apiUrl)
      .then(setAuthor)
      .finally(() => setLoadingAuthor(false));
  }, [data?.authorId, data?.author?.id]);

  useEffect(() => {
    if (!cache?.posts) cache.posts = {};
    if (!showParentPost || !data?.replyingToId) return;

    setLoadingParent(true);
    fetchPostCached(data.replyingToId, config.apiUrl)
      .then(setParentPost)
      .finally(() => setLoadingParent(false));
  }, [data?.replyingToId, showParentPost]);

  let content = (
    <div className="vertical">
      {author?.username && <p className="grey">@{author?.username ?? "..."}</p>}
      <div
        style={{ color: "var(--font)" }}
        dangerouslySetInnerHTML={{
          __html: markdown.render(data?.content ?? "Missing content"),
        }}
      />
      <div className="horizontal" style={{ gap: "5px" }}>
        {data?.edited === true && (
          <p className="grey horizontal centered" style={{ gap: "5px" }}>
            <i className="fa-solid fa-pen" />
            Edited ·
          </p>
        )}
        <p className="grey">
          {data?.created ? formatTime(data.created) : "Unknown date"}
        </p>
        {noSocial === false && (
          <>
            <p className="grey">· {data?.likes?.length ?? 0} likes</p>
            <p className="grey">· {data?.replies?.length ?? 0} replies</p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {showParentPost &&
        data?.replyingToId &&
        (loadingParent ? (
          <div className="reply">
            <Loading />
          </div>
        ) : (
          <div className="reply">
            <Post data={parentPost} noSocial={noSocial} showParentPost={false} />
          </div>
        ))}

      <div className="posts-post" style={style}>
        {loadingAuthor ? (
          <img alt="" src="/files/unknown-icon.png" loading="lazy" />
        ) : author?.id ? (
          <Link to={`/user?id=${author.id}`}>
            <img
              alt=""
              src={`${config.apiUrl}/users/user/${author.id}/avatar?size=64`}
              loading="lazy"
              onError={e => {
                e.target.onerror = null;
                e.target.src = "/files/unknown-icon.png";
              }}
            />
          </Link>
        ) : (
          <img alt="" src="/files/unknown-icon.png" loading="lazy" />
        )}

        {noSocial === false && data?.id ? (
          <Link to={"/post?id=" + data.id} style={{ height: "fit-content" }}>
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </>
  );
}
