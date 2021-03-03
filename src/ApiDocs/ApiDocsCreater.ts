import { writeFileSync, existsSync, lstatSync, readdirSync } from "fs";
import linq = require("linq");
import path = require("path");
import Action from "../Action";
import ApiDocsConfig from "./ApiDocsConfig";
import ApiDocsMdCreater from "./ApiDocsMdCreater";
import ApiDocsNoteParser from "./ApiDocsNoteParser";

export default class ApiDocsCreater {
  constructor(
    private readonly cfPath: string,
    private readonly config: ApiDocsConfig = {}
  ) {
    if (
      !this.cfPath ||
      !existsSync(this.cfPath) ||
      !lstatSync(this.cfPath).isDirectory()
    ) {
      throw new Error(
        "please input controllers folder path, for example 'src/controllers'"
      );
    }
  }

  get docs(): string {
    let result = "<!-- Automatically generated by CBA -->\n\n";
    if (this.config.title) {
      result += `# ${this.config.title}\n\n`;
    }
    if (this.config.subTitle) {
      result += `${this.config.subTitle}\n\n`;
    }
    result += this.readFilesFromFolder("");
    if (result.lastIndexOf("---")) {
      result = result.substr(0, result.length - 3).trimEnd();
    }
    result += "\n";

    return result;
  }

  public write(targetFile: string): void {
    if (!targetFile) {
      throw new Error(
        "please input target markdown file path, for example 'docs/api.md'"
      );
    }

    writeFileSync(path.join(process.cwd(), targetFile), this.docs);
  }

  private readFilesFromFolder(folderRePath: string): string {
    let result = "";
    const storageItems = linq
      .from(readdirSync(path.join(this.cfPath, folderRePath)))
      .select((item) => path.join(folderRePath, item))
      .toArray();

    const files = linq
      .from(storageItems)
      .where((storageItem) => {
        const stat = lstatSync(path.join(this.cfPath, storageItem));
        return (
          stat.isFile() &&
          (storageItem.endsWith(".js") || storageItem.endsWith(".ts"))
        );
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < files.length; i++) {
      const readFileResult = this.readFile(files[i]);
      if (readFileResult) {
        result += readFileResult;
        result += "\n\n---\n\n";
      }
    }

    const folders = linq
      .from(storageItems)
      .where((storageItem) => {
        const stat = lstatSync(path.join(this.cfPath, storageItem));
        return stat.isDirectory();
      })
      .orderBy((item) => item)
      .toArray();
    for (let i = 0; i < folders.length; i++) {
      result += this.readFilesFromFolder(folders[i]);
    }

    return result.trimEnd();
  }

  private readFile(relativePath: string): string {
    const file = path.join(process.cwd(), this.cfPath, relativePath);
    let action;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const actionClass = require(file).default;
      action = new actionClass() as Action;
      if (!action) return "";
    } catch (err) {
      return "";
    }

    let docs;
    if (action.docs) {
      docs = action.docs;
    } else {
      docs = new ApiDocsNoteParser(file).docs;
    }
    if (!docs) return "";
    else return new ApiDocsMdCreater(relativePath, docs, this.config).result;
  }
}
