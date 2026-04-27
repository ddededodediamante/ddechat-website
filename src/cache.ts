import config from "./config.js";
import api from "./api.js";

const cache: Record<string, any> = {};

let userPromise: Promise<any> | null = null;
let liveSocket: WebSocket | null = null;
let liveListeners: Map<string, Set<() => void>> = new Map();

export function getUserCached(): Promise<any> {
  if (cache["user"]) return Promise.resolve(cache["user"]);
  if (userPromise) return userPromise;

  userPromise = api
    .get("/users/me")
    .then(data => {
      cache["user"] = data?.data ?? {};
      return data?.data ?? {};
    })
    .catch(err => {
      if (err?.response?.status === 401) {
        cache["user"] = null;
        return null;
      }
      throw err;
    })
    .finally(() => {
      userPromise = null;
    });
  return userPromise;
}

export function refreshUserCached(): Promise<any> {
  if (userPromise) return userPromise;
  userPromise = api
    .get("/users/me")
    .then(data => {
      cache["user"] = data?.data ?? {};
      notifyListeners("userUpdated");
      return data?.data ?? {};
    })
    .catch(err => {
      if (err?.response?.status === 401) {
        cache["user"] = null;
        return null;
      }
      throw err;
    });
  return userPromise;
}

export function clearUserCached() {
  cache["user"] = null;
  liveSocket?.close();
  liveSocket = null;
}

let liveConnected = false;
let notificationSound: HTMLAudioElement | null = null;

export function connectLiveSocket() {
  if (liveConnected) return;

  const ws = new WebSocket(config.apiUrl.replace(/^http/, "ws") + "/users/live");

  ws.onopen = () => {
    liveConnected = true;
    ws.send(JSON.stringify({ type: "live:join", token: "cookie" }));
  };

  ws.onmessage = event => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "live:dmReceived" || data.type === "live:alert") {
        const isOnDMpage = window.location.pathname === "/directmessage";
        const isViewingSameUser =
          isOnDMpage && window.location.search.includes(`id=${data.from?.id}`);

        if (data.type === "live:alert" || !isViewingSameUser) {
          if (!notificationSound) {
            notificationSound = new Audio("/files/notification.wav");
            notificationSound.volume = 0.5;
          }
          if (!document.hasFocus()) notificationSound.play().catch(() => {});

          if (Notification.permission === "default") {
            Notification.requestPermission();
          } else if (Notification.permission === "granted") {
            const title =
              data.type === "live:dmReceived" ? "New Message" : "New Notification";
            const body =
              data.type === "live:dmReceived" && data.from
                ? `${data.from.username} sent you a message`
                : "You have a new notification";
            new Notification(title, {
              body,
              icon: `${config.apiUrl}/users/user/${data.from.id}/avatar`,
            });
          }
        }

        notifyListeners(data.type);
        refreshUserCached();
      }
    } catch (e) {
      console.error("Live socket parse error:", e);
    }
  };

  ws.onclose = () => {
    liveConnected = false;
    liveSocket = null;
    setTimeout(connectLiveSocket, 5000);
  };

  ws.onerror = () => {
    liveConnected = false;
  };

  liveSocket = ws;
}

export function onLiveNotification(type: string, callback: () => void) {
  if (!liveListeners.has(type)) liveListeners.set(type, new Set());
  liveListeners.get(type)!.add(callback);
  return () => {
    liveListeners.get(type)?.delete(callback);
  };
}

function notifyListeners(type: string) {
  liveListeners.get(type)?.forEach(cb => cb());
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

export function fetchUserCached(id: string) {
  if (inFlightUsers.has(id)) return inFlightUsers.get(id)!;

  const cached = getUser(id);
  if (cached) return Promise.resolve(cached.id === null ? null : cached);

  const promise = api
    .get(`/users/user/${id}`)
    .then(res => {
      saveUser(id, res.data);
      return res.data;
    })
    .catch(err => {
      if ((err?.status ?? err?.response?.status) === 404) {
        saveUser(id, {});
      }
      return null;
    })
    .finally(() => inFlightUsers.delete(id));

  inFlightUsers.set(id, promise);
  return promise;
}

export function fetchPostCached(id: string) {
  if (inFlightPosts.has(id)) return inFlightPosts.get(id)!;

  const cached = getPost(id);
  if (cached) return Promise.resolve(cached.id === null ? null : cached);

  const promise = api
    .get(`/posts/${id}`)
    .then(res => {
      savePost(id, res.data);
      if (res.data?.author) {
        saveUser(res.data.author.id, res.data.author);
      }
      return res.data;
    })
    .catch(err => {
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
