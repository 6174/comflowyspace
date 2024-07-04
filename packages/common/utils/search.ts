import _ from "lodash";

export const maxMatchLengthSearch = _.memoize((searchTerm: string, sourceString: string): number => {
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
}, (searchTerm: string, sourceString: string) => `${searchTerm}-${sourceString}`);

export const wordSplitSearch = _.memoize((searchTerm: string, sourceString: string): number => {
  // 将搜索词和源字符串转换为小写并分词
  const searchWords = searchTerm.toLowerCase().split(/\s+/);
  const sourceWords = sourceString.toLowerCase().split(/\s+/);

  let matchedWords = 0;
  let totalMatchLength = 0;

  // 检查每个搜索词是否存在于源字符串的词中
  for (const word of searchWords) {
    const matchedSourceWord = sourceWords.find(sourceWord => sourceWord.includes(word));
    if (matchedSourceWord) {
      matchedWords++;
      totalMatchLength += word.length;
    }
  }

  // 计算匹配度得分
  const matchScore = (matchedWords / searchWords.length) * totalMatchLength;

  return matchScore;
}, (searchTerm: string, sourceString: string) => `${searchTerm}-${sourceString}`);

// 优化的搜索评分函数
export const wordSplitSearchAdvance = _.memoize((searchValue: string, targetString: string): number => {
  const searchWords = searchValue.toLowerCase().split(/\s+/);
  const targetWords = targetString.toLowerCase().split(/\s+/);

  let totalScore = 0;
  let maxContinuousMatch = 0;

  for (const searchWord of searchWords) {
    let wordScore = 0;
    let continuousMatch = 0;

    for (const targetWord of targetWords) {
      if (targetWord.includes(searchWord)) {
        wordScore += searchWord.length;
        continuousMatch += 1;
        maxContinuousMatch = Math.max(maxContinuousMatch, continuousMatch);
      } else {
        continuousMatch = 0;
      }
    }

    totalScore += wordScore;
  }

  // 考虑连续匹配的权重
  return totalScore * (1 + maxContinuousMatch * 0.1);
}, (searchValue: string, targetString: string) => `${searchValue}-${targetString}`);