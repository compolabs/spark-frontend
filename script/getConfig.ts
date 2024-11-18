import fs from "fs/promises";

const CONFIG_FILES = ["config", "config-dev"];

export default function getConfig() {
  return {
    name: "download-config",
    async buildStart() {
      try {
        const existingFiles = await Promise.all(
          CONFIG_FILES.map((file) =>
            fs
              .access(`src/${file}.json`)
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (existingFiles.every(Boolean)) {
          console.log("All config files already exist. Skipping download.");
          return;
        }

        await Promise.all(
          CONFIG_FILES.map(async (config) => {
            const url = `https://raw.githubusercontent.com/compolabs/spark-frontend-config/refs/heads/main/${config}.json`;

            console.log(`Downloading config: ${config}`);
            const res = await fetch(url);

            if (!res.ok) {
              throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
            }

            const json = await res.json();

            const filePath = `src/${config}.json`;
            await fs.writeFile(filePath, JSON.stringify(json, null, 2));
            console.log(`Config file ${filePath} downloaded successfully.`);
          }),
        );

        console.log("All config files downloaded successfully.");
      } catch (error) {
        console.error("Error downloading config files:", error);
      }
    },
  };
}
