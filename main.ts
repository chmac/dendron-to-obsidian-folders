import { cliffy, fs, path } from "./deps.ts";

function convertFileName(fileName: string): string {
  const fileNameWithoutExtension = fileName.slice(0, -3);

  if (fileNameWithoutExtension.endsWith(".contact")) {
    return `${fileNameWithoutExtension.slice(0, -8)}.md`;
  }

  if (fileNameWithoutExtension.startsWith("daily.journal.")) {
    const year = fileNameWithoutExtension.slice(14, 18);
    const date = fileNameWithoutExtension.slice(14);
    const convertedDate = date.replaceAll(".", "-");
    return `daily/journal/${year}/${convertedDate}.md`;
  }

  const convertedFileNameWithoutExtension = fileNameWithoutExtension.replaceAll(
    ".",
    "/"
  );
  const convertedFileName = convertedFileNameWithoutExtension + ".md";
  return convertedFileName;
}

await new cliffy.Command()
  .name("d2folders")
  .version("0.1.0")
  .option("--dry-run", "Do not rename any files")
  .option("-d --debug", "Output debugging information")
  .arguments("<path:string>")
  .action(async (options, dendronPath: string) => {
    const pathGlob = path.join(dendronPath, "*.md");

    for await (const file of fs.expandGlob(pathGlob)) {
      if (!file.isFile || file.name.slice(-3) !== ".md") {
        continue;
      }

      const newFileName = convertFileName(file.name);
      const newFileNameDirName = path.dirname(newFileName);
      const newDirPath = path.join(dendronPath, newFileNameDirName);
      const newFilePath = path.join(dendronPath, newFileName);

      if (options.debug) {
        console.log(
          `${path.join(
            dendronPath,
            file.name
          )} -> ${newFilePath} in ${newDirPath}`
        );
      }

      if (options.dryRun) {
        continue;
      }

      await fs.ensureDir(newDirPath);
      await Deno.rename(file.path, newFilePath);
    }
  })
  .parse();
