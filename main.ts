import { cliffy, fs, path } from "./deps.ts";

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

      const fileNameWithoutExtension = file.name.slice(-3);
      const newBaseName = fileNameWithoutExtension.replaceAll(".", "/");
      const newFileName = newBaseName + ".md";
      const newFileNameDirName = path.dirname(newFileName);
      const newDirPath = path.join(dendronPath, newFileNameDirName);
      const newFilePath = path.join(dendronPath, newFileName);

      if (options.debug) {
        console.log(`${file.path} -> ${newFileName} in ${newDirPath}`);
      }

      if (options.dryRun) {
        continue;
      }

      await fs.ensureDir(newDirPath);
      await Deno.rename(file.path, newFilePath);
    }
  })
  .parse();
