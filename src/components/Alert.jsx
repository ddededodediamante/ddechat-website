import React, { useEffect, useState } from "react";
import moment from "moment";
import config from "../config.js";
import { Link } from "react-router-dom";
import Post from "./Post.jsx";
import { getPost, savePost, fetchUserCached } from "../cache.ts";
import axios from "axios";

async function fetchPost(id) {
  const cachedPost = getPost(id);
  if (cachedPost) return cachedPost;

  try {
    const response = await axios.get(`${config.apiUrl}/posts/${id}`);
    savePost(id, response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error("Error fetching post data:", error);
    }
    return null;
  }
}

async function fetchAuthor(id) {
  try {
    return await fetchUserCached(id, config.apiUrl);
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.error("Error fetching author data:", error);
    }
    return null;
  }
}

export default function Alert({ data }) {
  const [postData, setPostData] = useState(null);
  const [authorData, setAuthorData] = useState(null);

  useEffect(() => {
    if (data.type === "repliedPost" && data.data?.postId) {
      fetchPost(data.data.postId).then(setPostData);
    }
  }, [data]);

  useEffect(() => {
    if (data.author?.id) {
      fetchAuthor(data.author.id).then(setAuthorData);
    }
  }, [data]);

  const author = authorData || data.author;
  const authorId = author?.id || data.author?.id;
  const authorUsername = author?.username || data.author?.username || "Unknown";

  let message;

  switch (data.type) {
    case "postLike":
      message = (
        <p>
          {authorUsername} liked your{" "}
          <a href={`/post?id=${data.data?.postId}`}>post</a>.
        </p>
      );
      break;

    case "friendRequest":
      message = <p>{authorUsername} wants to add you as a friend.</p>;
      break;

    case "follow":
      message = <p>{authorUsername} is now following you.</p>;
      break;

    case "repliedPost":
      message = (
        <>
          <p>
            {authorUsername} made a{" "}
            <Link to={`/post?id=${data.data?.postId}`}>reply</Link> to your
            post.
          </p>
          {postData && (
            <Post
              data={postData}
              style={{
                backgroundColor: "var(--background)",
                marginTop: "10px",
                marginBottom: "10px",
              }}
              noSocial={true}
            />
          )}
        </>
      );
      break;

    case "moderatorWarning":
      message = (
        <p>
          {/* FIX: class -> className */}
          <img src="/src/static/emojis/symbols/x.png" alt=":x:" className="emoji-inline" loading="lazy" />
          {" Moderation warning: " + (data?.data?.reason || "Unknown reason.")}
        </p>
      );
      break;

    default:
      message = <p>Unknown notification</p>;
  }

  return (
    <div className={data.read === false ? "unread posts-post" : "posts-post"}>
      {authorId && (
        <Link to={`/user?id=${authorId}`}>
          <img
            alt=""
            src={`${config.apiUrl}/users/user/${authorId}/avatar`}
            loading="lazy"
          />
        </Link>
      )}
      <div className="vertical">
        {message}
        <p className="grey">{moment(data.receivedOn).fromNow()}</p>
      </div>
    </div>
  );
}
