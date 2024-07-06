export function endpoint(path: string): URL {
  return new URL(path, 'http://localhost:5000');
}
