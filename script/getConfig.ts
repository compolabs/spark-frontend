import fs from "fs/promises";

export default function getConfig(branch: string) {
  return {
    name: "download-config",
    async buildStart() {
      const isMain = branch === "main" || branch === "mainnet";
      const config = isMain ? "config" : "config-dev";

      console.log(`\nCurrent env: ${isMain ? "😱😱 MAINNET 😱😱" : "🟠🟠 DEVELOPMENT 🟠🟠"}\n`);

      console.log(config, branch);

      const url = `https://raw.githubusercontent.com/compolabs/spark-frontend-config/refs/heads/main/${config}.json`;
      const res = await fetch(url);
      const json = await res.json();

      await fs.writeFile("src/config.json", JSON.stringify(json, null, 2));
    },
  };
}
