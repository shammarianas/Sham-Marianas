const SEARCHABLE_FIELDS = [
  { key: "title", weight: 10 },
  { key: "tags", weight: 8 },
  { key: "category", weight: 6 },
  { key: "type", weight: 4 },
  { key: "description", weight: 3 },
  { key: "keywords", weight: 8 },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const toText = (value) =>
  Array.isArray(value) ? value.map((entry) => String(entry ?? "")).join(" ") : String(value ?? "");

const editDistanceWithin = (left, right, maxDistance) => {
  if (Math.abs(left.length - right.length) > maxDistance) return false;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost =
        left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      const distance = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost
      );

      current.push(distance);
      rowMinimum = Math.min(rowMinimum, distance);
    }

    if (rowMinimum > maxDistance) return false;
    previous = current;
  }

  return previous[right.length] <= maxDistance;
};

const scoreTokenAgainstField = (token, fieldText, weight) => {
  const fieldWords = fieldText.split(" ");
  let bestScore = 0;

  for (const word of fieldWords) {
    if (word === token) {
      bestScore = Math.max(bestScore, weight * 3);
    } else if (word.startsWith(token)) {
      bestScore = Math.max(bestScore, weight * 2);
    } else if (word.includes(token)) {
      bestScore = Math.max(bestScore, weight * 1.5);
    } else if (token.length >= 4) {
      const allowedDistance = token.length >= 7 ? 2 : 1;
      if (editDistanceWithin(token, word, allowedDistance)) {
        bestScore = Math.max(bestScore, weight);
      }
    }
  }

  return bestScore;
};

const getAssetSearchScore = (asset, queryTokens, normalizedQuery) => {
  const fields = SEARCHABLE_FIELDS.map(({ key, weight }) => ({
    text: normalize(toText(asset?.[key])),
    weight,
  })).filter(({ text }) => text);

  let score = 0;

  for (const token of queryTokens) {
    let bestTokenScore = 0;

    for (const field of fields) {
      bestTokenScore = Math.max(
        bestTokenScore,
        scoreTokenAgainstField(token, field.text, field.weight)
      );
    }

    if (bestTokenScore === 0) return 0;
    score += bestTokenScore;
  }

  for (const field of fields) {
    if (field.text.includes(normalizedQuery)) {
      score += field.weight * 2;
    }
  }

  return score;
};

export const rankAssetsByRelevance = (assets, searchTerm) => {
  const normalizedQuery = normalize(searchTerm);
  const queryTokens = normalizedQuery
    .split(" ")
    .filter((token) => token && !STOP_WORDS.has(token));

  if (!queryTokens.length) return [];

  return assets
    .map((asset, index) => ({
      asset,
      index,
      score: getAssetSearchScore(asset, queryTokens, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ asset }) => asset);
};
