import moment from "moment";
import config from "../config.json";
import { Link } from "react-router-dom";

export default function Post({ data }) {
    let hasReplies = (data?.replies !== null && data?.replies?.length !== null)

    return (
        <div className="posts-post">
            {data?.author?.id &&
                <Link to={`/user?username=${data.author.username}`}>
                    <img
                        alt=""
                        src={`${config.apiUrl}/users/user/${data.author.username}/avatar`}
                    />
                </Link>
            }
            <Link to={'/post?id=' + data.id}>
                <div className="vertical">
                    <p style={{ color: "#fff" }}>{data.content ?? 'Missing content'}</p>
                    <div className="horizontal" style={{ gap: '5px' }}>
                        <p className="grey">{data?.likes?.length ?? 0} likes</p>
                        <p className="grey">· {moment(data.created).fromNow()}</p>
                        {hasReplies &&
                            <p className="grey">· {data?.replies?.length ?? 0} replies</p>
                        }
                    </div>
                </div>
            </Link>
        </div>
    );
};