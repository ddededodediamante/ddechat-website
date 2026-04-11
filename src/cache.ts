import axios from "axios";
import config from "./config";

const cache: Record<string, any> = {};

let userPromise: Promise<any> | null = null;

export function getUserCached(): Promise<any> {
  if (cache["user"]) return Promise.resolve(cache["user"]);
  if (userPromise) return userPromise;

  const token = localStorage.getItem("accountToken");
  if (!token || token === "") return Promise.reject(new Error("Missing token"));

  userPromise = axios.get(`${config.apiUrl}/users/me`, {
    headers: { Authorization: token },
  })
    .then((data) => {
      cache["user"] = data?.data ?? {};
      return data?.data ?? {};
    })
    .finally(() => {
      userPromise = null;
    });

  return userPromise;
}

export function savePost(id: string, data: any) {
  if (!cache.posts) cache.posts = {};
  cache.posts[id] = data;
}

export function getPost(id: string): any {
  if (!cache.posts) cache.posts = {};
  return cache.posts?.[id] ?? null;
}

export function saveUser(id: string, data: any) {
  if (!cache.users) cache.users = {};
  cache.users[id] = data;
}

export function getUser(id: string) {
  return cache.users?.[id] ?? null;
}

const inFlightUsers = new Map<string, Promise<any>>();
const inFlightPosts = new Map<string, Promise<any>>();

export function fetchUserCached(id: string, apiUrl: string) {
  if (inFlightUsers.has(id)) return inFlightUsers.get(id)!;

  const cached = getUser(id);
  if (cached) return Promise.resolve(cached.id === null ? null : cached);

  const promise = axios
    .get(`${apiUrl}/users/user/${id}`)
    .then((res) => {
      saveUser(id, res.data);
      return res.data;
    })
    .catch((err) => {
      if ((err?.status ?? err?.response?.status) === 404) {
        saveUser(id, {});
      }
      return null;
    })
    .finally(() => inFlightUsers.delete(id));

  inFlightUsers.set(id, promise);
  return promise;
}

export function fetchPostCached(id: string, apiUrl: string) {
  if (inFlightPosts.has(id)) return inFlightPosts.get(id)!;

  const cached = getPost(id);
  if (cached) return Promise.resolve(cached.id === null ? null : cached);

  const promise = axios
    .get(`${apiUrl}/posts/${id}`)
    .then((res) => {
      savePost(id, res.data);
      return res.data;
    })
    .catch((err) => {
      if ((err?.status ?? err?.response?.status) === 404) {
        savePost(id, {});
      } else {
        console.error("Failed to fetch post:", err);
      }
      return null;
    })
    .finally(() => inFlightPosts.delete(id));

  inFlightPosts.set(id, promise);
  return promise;
}

export default cache;
