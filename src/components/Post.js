import formatTime from "../functions/time";
import config from "../config.js";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import cache, { getPost, savePost } from "../cache.ts";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({ breaks: true, linkify: true });

export default function Post({
  data,
  noSocial = false,
  showParentPost = false,
}) {
  const [parentPost, setParentPost] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);

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
          .then((parentData) => {
            savePost(data.replyingToId, parentData.data);
            setParentPost(parentData.data);
          })
          .catch((err) => {
            if ((err?.status ?? err?.response?.status) === 404) {
              savePost(data.replyingToId, {});
              setParentPost(null);
            } else {
              console.error("Failed to fetch parent post:", err);
            }
            console.error(err)
          })
          .finally(() => {
            setLoadingParent(false);
          });
      } else setParentPost(cached);
    }
  }, [data?.replyingToId, showParentPost]);

  let content = (
    <div className="vertical">
      {data?.author?.username && (
        <p className="grey">@{data.author.username}</p>
      )}
      <div
        style={{ color: "var(--font)" }}
        dangerouslySetInnerHTML={{
          __html: md.render(data?.content ?? "Missing content"),
        }}
      />
      <div className="horizontal" style={{ gap: "5px" }}>
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
      {(showParentPost && data?.replyingToId) &&
        (loadingParent ? (
          <div
            style={{
              borderLeft: "4px solid var(--light)",
              paddingLeft: "10px",
            }}
          >
            <Loading />
          </div>
        ) : (
          <div
            style={{
              borderLeft: "4px solid var(--light)",
              paddingLeft: "10px",
            }}
          >
            <Post data={parentPost} noSocial={noSocial} showParentPost={false} />
          </div>
        ))}

      <div className="posts-post">
        {data?.author?.id ? (
          <Link to={`/user?id=${data.author.id}`}>
            <img
              alt=""
              src={`${config.apiUrl}/users/${data.author.id}/avatar`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/files/unknown-icon.png";
              }}
            />
          </Link>
        ) : (
          <img alt="" src="/files/unknown-icon.png" />
        )}

        {noSocial === false && data?.id ? (
          <Link to={"/post?id=" + data.id}>{content}</Link>
        ) : (
          content
        )}
      </div>
    </>
  );
}
