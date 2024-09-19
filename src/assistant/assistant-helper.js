/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { ImportBuilderFactory } from 'aem-import-builder';
import {readFromFile, writeToFile} from '../utils/fileUtils.js';
import chalk from 'chalk';
import ora from 'ora';

const IMPORTER_PATH = '/tools/importer';

const getDocumentSet = (outputPath) => {
  const manifestText = readFromFile(`.${outputPath}/documentSet.json`);
  const manifestArray = manifestText ? JSON.parse(manifestText) : [];
  return new Set(manifestArray);
}

const getRules = async (outputPath) => {
  const rulesModule = await import(`${process.cwd()}${outputPath}/import-rules.js`);
  return rulesModule.default;
}

const getBuilder = async (url, {useExisting = false, outputPath}) => {
  console.log(chalk.magenta('Import assistant is analyzing the page...'));
  const factory = ImportBuilderFactory();
  const spinner = ora({ text: 'Initializing...', color: 'yellow' });
  factory.on('start', (msg) => {
    spinner.start(chalk.yellow(msg));
  });
  factory.on('progress', (msg) => {
    spinner.text = chalk.yellow(msg);
  });
  factory.on('complete', () => {
    spinner.succeed();
  });
  const documents = useExisting ? getDocumentSet(outputPath) : undefined;
  const rules = useExisting? await getRules(outputPath) : undefined;
  return factory.create(url, {mode: 'script', rules, documents});
}

const writeManifestFiles = (manifest, outputPath) => {
  const { files = [] } = manifest;
  files.forEach(({ name, contents }) => {
    writeToFile(`.${outputPath}${name}`, contents);
  });
}

const getDurationText = (startTime) => {
  const duration = Date.now() - startTime;
  const minutes = Math.floor(duration / 6000);
  const seconds = ((duration % 6000) / 1000).toFixed(2);
  return `${minutes} minutes ${seconds} seconds`;
}

const runStartAssistant = async ({url, outputPath = IMPORTER_PATH}) => {
  const startTime = Date.now();
  const builder = await getBuilder(url, {outputPath});
  const manifest = await builder.buildProject();
  writeManifestFiles(manifest, outputPath);
  console.log(chalk.green(`Import scripts generated successfully in ${getDurationText(startTime)}`));
};

const runRemovalAssistant = async ({url, prompt, outputPath = IMPORTER_PATH}) => {
  const startTime = Date.now();
  const builder = await getBuilder(url, {useExisting:  true, outputPath});
  const manifest = await builder.addCleanup(prompt);
  writeManifestFiles(manifest, outputPath);
  console.log(chalk.green(`Removal script generated successfully in ${getDurationText(startTime)}`));
};

const runBlockAssistant = async ({url, name, prompt, outputPath = IMPORTER_PATH}) => {
  const startTime = Date.now();
  const builder = await getBuilder(url, {useExisting:  true, outputPath});
  const manifest = await builder.addBlock(name, prompt);
  writeManifestFiles(manifest, outputPath);
  console.log(chalk.green(`Block scripts generated successfully in ${getDurationText(startTime)}`));
};

const runCellAssistant = async ({url, name, prompt, outputPath = IMPORTER_PATH}) => {
  const startTime = Date.now();
  const builder = await getBuilder(url, {useExisting:  true, outputPath});
  const manifest = await builder.addCells(name, prompt);
  writeManifestFiles(manifest, outputPath);
  console.log(chalk.green(`${name} block parser generated successfully in ${getDurationText(startTime)}`));
};

export { runRemovalAssistant, runBlockAssistant, runStartAssistant, runCellAssistant };
