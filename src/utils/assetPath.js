export const getAssetPath = (asset) => {
  if (!asset) return "#";

  const slug = asset.slug || asset.id;
  if (!slug) return "#";

  const rawType = (asset.type || "").toLowerCase();
  const type = rawType === "models" ? "3dmodels" : rawType === "mockups" ? "tools" : rawType;
  return type ? `/templates/${type}/${slug}` : `/view/${slug}`;
};
