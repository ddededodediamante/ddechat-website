import axios from "axios";
import config from "./config";

const cache: Record<string, any> = {};

let userPromise: Promise<any> | null = null;

export function getUserCached(): Promise<any> {
  if (cache["user"]) return Promise.resolve(cache["user"]);
  if (userPromise) return userPromise;

  const token = localStorage.getItem("accountToken");
  if (!token || token === "") throw new Error("Missing token");

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

export default cache;
