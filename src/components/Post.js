import formatTime from "../functions/time";
import config from "../config.js";
import { Link } from "react-router-dom";
import markdownit from "markdown-it";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import cache from "../cache.ts";

export default function Post({
  data,
  noSocial = false,
  showParentPost = false,
}) {
  const [parentPost, setParentPost] = useState(null);
  const [loadingParent, setLoadingParent] = useState(false);

  let hasReplies = data?.replies && data.replies.length > 0;

  if (
    (!data.author || !data.author.username) &&
    typeof data.username === "string"
  ) {
    data.author = {
      username: data.username,
    };
  }

  useEffect(() => {
    if (!cache["posts"]) cache["posts"] = {};

    if (showParentPost && data?.replyingToId) {
      if (!cache["posts"][data.replyingToId]) {
        setLoadingParent(true);
        axios
          .get(`${config.apiUrl}/posts/${data.replyingToId}`)
          .then((parentData) => {
            cache["posts"][data.replyingToId] = parentData.data;
            setParentPost(parentData.data);
            setLoadingParent(false);
          })
          .catch(() => {
            setParentPost(null);
            setLoadingParent(false);
          });
      } else {
        setParentPost(cache["posts"][data.replyingToId]);
      }
    }
  }, [data.replyingToId, showParentPost]);

  let content = (
    <div className="vertical">
      {data?.author?.username && (
        <p className="grey">@{data.author.username}</p>
      )}
      <p
        style={{ color: "var(--font)" }}
        dangerouslySetInnerHTML={{
          __html: markdownit().renderInline(data.content ?? "Missing content"),
        }}
      />
      <div className="horizontal" style={{ gap: "5px" }}>
        <p className="grey">{data?.created ? formatTime(data.created) : 'Unknown date'}</p>
        {noSocial === false && (
          <>
            <p className="grey">· {data?.likes?.length ?? 0} likes</p>
            {hasReplies && (
              <p className="grey">· {data?.replies?.length ?? 0} replies</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {showParentPost && (loadingParent || parentPost) && (
        <div
          style={{
            borderLeft: "4px solid var(--light)",
            paddingLeft: "10px",
          }}
        >
          {loadingParent ? (
            <Loading />
          ) : (
            <Post data={parentPost} noSocial showParentPost={false} />
          )}
        </div>
      )}

      <div className="posts-post">
        {data?.author?.id && (
          <Link to={`/user?id=${data.author.id}`}>
            <img
              alt=""
              src={`${config.apiUrl}/users/${data.author.id}/avatar`}
            />
          </Link>
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
