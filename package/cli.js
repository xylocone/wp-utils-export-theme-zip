import chalk from "chalk";
import zipLib from "zip-lib";
import { access } from "fs";
import { promisify } from "util";
import { extname } from "path";

const accessAsync = promisify(access);

export async function cli(args) {
  let zipFileName = (args[0] || "theme") + ".zip";
  console.log(
    chalk.blue("Packaging the theme into"),
    chalk.magenta(zipFileName),
    "..."
  );

  await packageFilesAndFolders(zipFileName);
}

/**
 * Add files and folders to be packaged and package them
 */
async function packageFilesAndFolders(zipFileName) {
  const zip = new zipLib.Zip();

  const itemsToAdd = [
    "index.php",
    "style.css",
    "blocks/build",
    "gutenberg_utils",
    "functions.php",
    "gutenberg.php",
    "templates",
    "parts",
  ];

  for (let item of itemsToAdd) await addPathToArchive(zip, item);

  try {
    await zip.archive(`./${zipFileName}`);
    console.log(
      "%s Exported theme to %s",
      chalk.bgGreen("SUCCESS!"),
      chalk.magenta(zipFileName)
    );
  } catch (e) {
    console.error("%s We ran into a problem.", chalk.bgRed("ERROR!"));
    console.trace(e);
  }
}

/**
 * Checks if the given path exists
 * @param {String} path Path to check
 */
async function pathExists(path) {
  try {
    await accessAsync(path);
    return true;
  } catch (e) {
    console.log(
      "%s %s does not exist.",
      chalk.yellow("WARNING!"),
      chalk.blue(path)
    );
    return false;
  }
}

/**
 * Add a path to a Zip instance
 * @param {Zip} zipInstance Zip instance to which the path is to be added
 * @param {String} path Path which is to be added to the Zip instance
 */
async function addPathToArchive(zipInstance, path) {
  if (await pathExists(path)) {
    if (!extname(path)) {
      zipInstance.addFile(path, path);
      zipInstance.addFolder(path, path);
      // path is a directory
    } else zipInstance.addFile(path, path); // path is a file
  }
}
