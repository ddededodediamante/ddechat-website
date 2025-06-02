import moment from "moment";
import config from "../config.js";
import { Link } from "react-router-dom";

export default function Alert({ data }) {
    let message;

    switch (data.type) {
        case 'postLike': {
            message = <p>
                {data.author.username} liked your <a href={'/post?id=' + data.data?.postId}>post</a>.
            </p>;
            break;
        }
        case 'friendRequest': {
            message = <p>
                {data.author.username} wants to add you as a friend!
            </p>;
            break;
        }
        case 'repliedPost': {
            message = <p>
                {data.author.username} made a <a href={'/post?id=' + data.data?.postId}>reply</a> to your post.
            </p>;
            break;
        }
        default: {
            message = <p>Unknown notification</p>;
        }
    }

    return (
        <div className={data.read === false ? "unread posts-post" : "posts-post"}>
            {data.author.id &&
                <Link to={`/user?id=${data.author.id}`}>
                    <img
                        alt=""
                        src={`${config.apiUrl}/users/${data.author.id}/avatar`}
                    />
                </Link>
            }
            <div className="vertical">
                {message}
                <p className="grey">{moment(data.receivedOn).fromNow()}</p>
            </div>
        </div>
    );
};