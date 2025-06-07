const cache: Record<string, any> = {};

function isValidPost(data: any): boolean {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0)
    return false;

  if ("replies" in data) {
    if (!Array.isArray(data?.replies)) return false;
    if (
      data?.replies.some(
        (r: any) => typeof r !== "object" || r === null || Array.isArray(r)
      )
    )
      return false;
  }

  return true;
}

export function savePost(id: string, data: any): boolean {
  if (!cache?.posts) cache.posts = {};
  if (!isValidPost(data)) return false;
  cache.posts[id] = data;
  return true;
}

export function getPost(id: string): any {
  if (!cache?.posts) cache.posts = {};
  return cache?.posts?.[id];
}

export default cache;
