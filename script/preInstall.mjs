import fs from "fs/promises";

const buildStart = async () => {
  try {
    const text =
      `@compolabs:registry=https://npm.pkg.github.com/
          //npm.pkg.github.com/:_authToken=` + process.env.NPM_AUTH_TOKEN;
    console.log("text", text);
    console.log('process.env', process.env);
    const filePath = `.npmrc`;
    await fs.writeFile(filePath, text);
    console.log(`Config file ${filePath} downloaded successfully.`);

    console.log("All config files downloaded successfully.");
  } catch (error) {
    console.error("Error downloading config files:", error);
  }
};
buildStart();
