export function maxMatchLengthSearch(searchTerm: string, sourceString: string): number {
  let maxMatch = 0;
  for (let i = 0; i < sourceString.length; i++) {
    for (let j = i + 1; j <= sourceString.length; j++) {
      const subStr = sourceString.slice(i, j);
      if (searchTerm.includes(subStr) && subStr.length > maxMatch) {
        maxMatch = subStr.length;
      }
    }
  }
  return maxMatch;
}