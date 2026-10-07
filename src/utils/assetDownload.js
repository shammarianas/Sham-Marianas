export const getAssetDownloadFilename = (title, source) => {
  let sourceFilename = "";

  if (typeof source === "string") {
    const sourcePath = source.split(/[?#]/, 1)[0];
    let decodedPath = sourcePath;

    try {
      decodedPath = decodeURIComponent(sourcePath);
    } catch (error) {
      console.warn("Could not decode asset filename from URL:", error);
    }

    sourceFilename = decodedPath.split(/[\\/]/).pop() || "";
  }

  const extension = sourceFilename.match(/\.[a-z\d]{1,10}$/i)?.[0] || "";
  const safeTitle = typeof title === "string"
    ? title.replace(/[<>:"/\\|?*]/g, "_").trim().replace(/[. ]+$/, "")
    : "";
  const fallbackName = sourceFilename.replace(/\.[a-z\d]{1,10}$/i, "");
  const filename = safeTitle || fallbackName || "download";

  return extension && !filename.toLowerCase().endsWith(extension.toLowerCase())
    ? `${filename}${extension}`
    : filename;
};
