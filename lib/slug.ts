import _slugify from 'slugify';

export function slugify(input: string) {
  return _slugify(input, { lower: true, strict: true, trim: true });
}
