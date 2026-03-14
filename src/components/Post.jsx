import formatTime from "../functions/time.js";
import config from "../config.js";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading.jsx";
import cache, { getPost, savePost, getUser, saveUser } from "../cache.ts";
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

    const cached = getUser(authorId);
    if (cached) {
      setAuthor(cached.id === null ? null : cached);
      return;
    }

    setLoadingAuthor(true);
    axios
      .get(`${config.apiUrl}/users/user/${authorId}`)
      .then(res => {
        saveUser(authorId, res.data);
        setAuthor(res.data);
      })
      .catch(err => {
        if ((err?.status ?? err?.response?.status) === 404) {
          saveUser(authorId, {});
          setAuthor(null);
        } else {
          console.error("Failed to fetch author:", err);
        }
      })
      .finally(() => setLoadingAuthor(false));
  }, [data?.authorId, data?.author?.id]);

  useEffect(() => {
    if (!cache?.posts) cache.posts = {};

    if (showParentPost && data?.replyingToId) {
      const cached = getPost(data.replyingToId);

      if (cached && cached.id === null) {
        setParentPost(null);
        return;
      }

      if (!cached) {
        setLoadingParent(true);
        axios
          .get(`${config.apiUrl}/posts/${data.replyingToId}`)
          .then(parentData => {
            savePost(data.replyingToId, parentData.data);
            setParentPost(parentData.data);
          })
          .catch(err => {
            if ((err?.status ?? err?.response?.status) === 404) {
              savePost(data.replyingToId, {});
              setParentPost(null);
            } else {
              console.error("Failed to fetch parent post:", err);
            }
            console.error(err);
          })
          .finally(() => {
            setLoadingParent(false);
          });
      } else setParentPost(cached);
    }
  }, [data?.replyingToId, showParentPost]);

  let content = (
    <div className="vertical">
      {author?.username && <p className="grey">@{author.username}</p>}
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
          <div style={{ width: 40, height: 40 }} />
        ) : author?.id ? (
          <Link to={`/user?id=${author.id}`}>
            <img
              alt=""
              src={`${config.apiUrl}/users/user/${author.id}/avatar`}
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
