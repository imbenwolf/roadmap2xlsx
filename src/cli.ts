#!/usr/bin/env node

import { Command } from "commander";
import { generateRoadmap } from "./roadmap";

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

generateRoadmap(options.input, options.output)
  .then(() => {
    console.log(`Roadmap successfully saved to ${options.output}`);
  })
  .catch((error) => {
    console.error("Error processing XLSX:", error);
    process.exit(1);
  });
