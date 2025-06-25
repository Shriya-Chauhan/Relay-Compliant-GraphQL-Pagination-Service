export const encodeCursor = ({ sortValue, id }) => {
  return Buffer.from(`${sortValue}:::${id}`)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const decodeCursor = (cursor) => {
  let base64 = cursor.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const [sortValue, id] = Buffer.from(base64, "base64")
    .toString("utf-8")
    .split(":::");
  return { sortValue, id };
};
