import React, { useEffect, useState } from "react";
import moment from "moment";
import config from "../config.js";
import { Link } from "react-router-dom";
import Post from "./Post.js";
import { getPost, savePost } from "../cache.ts";
import axios from "axios";

async function fetchPost(id) {
  const cachedPost = getPost(id);
  if (cachedPost) return cachedPost;

  try {
    const response = await axios.get(`${config.apiUrl}/posts/${id}`);
    savePost(id, response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching post data:", error);
    return null;
  }
}

export default function Alert({ data }) {
  const [postData, setPostData] = useState(null);

  useEffect(() => {
    if (data.type === "repliedPost" && data.data?.postId) {
      fetchPost(data.data.postId).then(setPostData);
    }
  }, [data]);

  let message;

  switch (data.type) {
    case "postLike":
      message = (
        <p>
          {data.author.username} liked your{" "}
          <a href={`/post?id=${data.data?.postId}`}>post</a>.
        </p>
      );
      break;

    case "friendRequest":
      message = <p>{data.author.username} wants to add you as a friend.</p>;
      break;

    case "follow":
      message = <p>{data.author.username} is now following you.</p>;
      break;

    case "repliedPost":
      message = (
        <>
          <p>
            {data.author.username} made a{" "}
            <a href={`/post?id=${data.data?.postId}`}>reply</a> to your post.
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

    default:
      message = <p>Unknown notification</p>;
  }

  return (
    <div className={data.read === false ? "unread posts-post" : "posts-post"}>
      {data?.author?.id && (
        <Link to={`/user?id=${data.author.id}`}>
          <img alt="" src={`${config.apiUrl}/users/${data.author.id}/avatar`} />
        </Link>
      )}
      <div className="vertical">
        {message}
        <p className="grey">{moment(data.receivedOn).fromNow()}</p>
      </div>
    </div>
  );
}
