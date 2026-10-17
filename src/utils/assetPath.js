export const getAssetPath = (asset) => {
  if (!asset) return "#";

  const slug = asset.slug || asset.id;
  if (!slug) return "#";

  const type = (asset.type || "").toLowerCase();
  return type ? `/templates/${type}/${slug}` : `/view/${slug}`;
};
