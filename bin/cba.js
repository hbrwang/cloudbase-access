#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

const shell = require("shelljs");
const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "cba.config.json");
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");

if (!fs.existsSync(configPath)) {
  throw new Error(`cba.config.json is not exist`);
}
const config = require(configPath);

let outDir = "/";
if (fs.existsSync(path.join(process.cwd(), "tsconfig.json"))) {
  const tsconfig = require(tsconfigPath);
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) {
    outDir = tsconfig.compilerOptions.outDir;
  }

  const targetRoot = path.join(process.cwd(), outDir);
  deleteFile(targetRoot);

  const tscResult = shell.exec("tsc");
  if (tscResult.code != 0) {
    throw new Error(tscResult.stderr);
  } else {
    console.log(tscResult.stdout);
  }
  deleteFile(outDir, ".d.ts");

  if (config.static && config.static.length) {
    config.static.forEach(({ source, target }) => {
      const sourcePath = path.join(process.cwd(), source);
      const targetPath = path.join(process.cwd(), outDir, target);
      copyFile(sourcePath, targetPath);
    });
  }
  copyFile(
    path.join(process.cwd(), "package.json"),
    path.join(process.cwd(), outDir, "package.json")
  );
}

const MapCreater = require("../dist/Map/MapCreater").default;
const mapCreater = new MapCreater(path.join(outDir, config.router.controllers));
if (config.map && config.map.target) {
  mapCreater.write(path.join(outDir, config.map.target));
} else {
  mapCreater.write();
}

function deleteFile(filePath, type = undefined) {
  if (!fs.existsSync(filePath)) return;

  const stat = fs.statSync(filePath);
  if (stat.isFile()) {
    if (!type || filePath.endsWith(type)) {
      fs.unlinkSync(filePath);
    }
  } else if (stat.isDirectory()) {
    fs.readdirSync(filePath).forEach((file) => {
      deleteFile(path.join(filePath, file), type);
    });
    if (!fs.readdirSync(filePath).length) {
      fs.rmdirSync(filePath);
    }
  }
}

function copyFile(source, target) {
  if (!fs.existsSync(source)) return;
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target);
    }
    const files = fs.opendirSync(source);
    files.forEach((file) => {
      copyFile(path.join(source, file), path.join(target, file));
    });
  } else if (stat.isFile()) {
    fs.copyFileSync(source, target);
  }
}
