import fs from "fs/promises";

export default function getConfig() {
  return {
    name: "download-config",
    async buildStart() {
      const url = "https://raw.githubusercontent.com/compolabs/spark-frontend-config/main/config.json";
      const res = await fetch(url);
      const json = await res.json();

      await fs.writeFile("src/config.json", JSON.stringify(json, null, 2));
    },
  };
}
