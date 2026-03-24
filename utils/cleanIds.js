function cleanIds(data) {
  if (!data) return [];
  return [data]
    .flat()
    .filter(Boolean)
    .map(Number)
    .filter(id => Number.isInteger(id));
}

module.exports = cleanIds;