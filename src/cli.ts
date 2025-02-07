#!/usr/bin/env node

import { Command } from "commander";
import { generateRoadmap } from "./roadmap";
import { parseTsv } from "./parse";

export async function main(): Promise<void> {
  const program = new Command();

  program
    .option("--input <path>", "Path to the input TSV file")
    .option("--output <path>", "Path to the output XLSX file")
    .parse(process.argv);

  const options = program.opts();

  if (!options.input || !options.output) {
    console.error("Error: --input and --output options are required.");
    process.exit(1);
  }

  try {
    const project = await parseTsv(options.input);
    await generateRoadmap(project, options.output);
    console.log(`Roadmap successfully saved to ${options.output}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
