export function isBoolean(value: string): boolean {
  return ['true', 'false'].indexOf(value) >= 0;
}
