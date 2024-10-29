import fs from "fs/promises";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function getConfig(branch: string) {
  return {
    name: "download-config",
    async buildStart() {
      // const isMain = branch === "main" || branch === "mainnet";
      const isMain = false;
      const config = isMain ? "config" : "config-dev";

      console.log(`\nCurrent env: ${isMain ? "😱😱 MAINNET 😱😱" : "🟠🟠 DEVELOPMENT 🟠🟠"}\n`);

      try {
        await fs.access("src/config.json");
        console.log("Config file already exists. Skipping download.");
        return;
        // eslint-disable-next-line no-empty
      } catch (error) {}

      const url = `https://raw.githubusercontent.com/compolabs/spark-frontend-config/refs/heads/main/${config}.json`;
      const res = await fetch(url);
      const json = await res.json();

      await fs.writeFile("src/config.json", JSON.stringify(json, null, 2));
      console.log("Config file downloaded successfully.");
    },
  };
}
