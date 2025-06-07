const cache: Record<string, any> = {};

export function savePost(id: string, data: any): boolean {
  if (!cache?.posts) cache.posts = {};
  cache.posts[id] = data;
  return true;
}

export function getPost(id: string): any {
  if (!cache?.posts) cache.posts = {};
  return cache?.posts?.[id];
}

export default cache;
