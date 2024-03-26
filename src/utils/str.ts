/***
 * Splits a string at the first encountered delimiter, scanning the string
 * starting from the end.
 */
export function splitRight(input: string, delimiter: string): [string, string] | null {
  const lastIndex = input.lastIndexOf(delimiter);
  if (lastIndex === -1) {
    return null; // No underscore found
  }
  const firstPart = input.slice(0, lastIndex);
  const secondPart = input.slice(lastIndex + 1);
  return [firstPart, secondPart];
}
