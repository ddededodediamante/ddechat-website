import React, { useEffect, useState } from "react";
import moment from "moment";
import config from "../config.js";
import { Link } from "react-router-dom";
import Post from "./Post.jsx";
import { getPost, savePost, fetchUserCached } from "../cache.ts";
import axios from "axios";
import api from "../api.js";
import demojis from "demojis";

async function fetchPost(id) {
  const cachedPost = getPost(id);
  if (cachedPost) return cachedPost;
  try {
    const response = await api.get(`/posts/${id}`);
    savePost(id, response.data);
    return response.data;
  } catch (error) {
    console.error(error);
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
    const authorId = data?.author?.id || postData?.authorId;
    if (data.author && authorId) {
      if (data.author.username) {
        setAuthorData(data.author);
      } else {
        fetchUserCached(authorId).then(setAuthorData);
      }
    }
  }, [data, postData]);

  const author = authorData || data.author;
  const authorId = author?.id ?? postData?.authorId;
  const authorUsername = author?.username || data.author?.username || "Unknown";

  let message;

  switch (data.type) {
    case "postLike":
      message = (
        <p>
          {authorUsername} liked your <a href={`/post?id=${data.data?.postId}`}>post</a>.
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
            <Link to={`/post?id=${data.data?.postId}`}>reply</Link> to your post.
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
          <img
            src={demojis.getImage("x", 128)}
            alt=":x:"
            className="emoji-inline"
            loading="lazy"
          />
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
