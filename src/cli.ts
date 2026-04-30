#!/usr/bin/env node
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envResult = dotenv.config({ path: path.resolve(__dirname, "..", ".env"), override: true });
if (envResult.parsed) {
  for (const [key, value] of Object.entries(envResult.parsed)) {
    process.env[key] = value;
  }
}
import { GTMCommander } from "./agents/commander.js";
import type { AgentName } from "./agents/commander.js";
import type { ProductInput, GTMContext } from "./types/context.js";

const program = new Command();

program
  .name("gtm-copilot")
  .description("AI Product GTM Co-Pilot — multi-agent GTM platform for AI products")
  .version("1.0.0");

// ---- Full Pipeline Command ----
program
  .command("pipeline")
  .description("Run full GTM pipeline: Scout → Strategist → Content Engine")
  .requiredOption("-n, --name <name>", "Product name")
  .requiredOption("-d, --desc <description>", "Product description")
  .option("-u, --url <url>", "Product URL")
  .option("-c, --category <category>", "Product category (e.g. AI DevTool, AI SaaS)")
  .option("-s, --stage <stage>", "Company stage (e.g. pre-seed, seed, series-a)")
  .option("-t, --target <audience>", "Target audience description")
  .option("-l, --lang <language>", "Language market: en, cn, or both", "en")
  .option("-o, --output <dir>", "Output directory", "output")
  .action(async (opts) => {
    const input = buildInput(opts);
    printHeader();
    console.log(chalk.cyan("▸ Mode: Full Pipeline"));
    console.log(chalk.cyan(`▸ Product: ${input.name}`));
    console.log();

    const commander = new GTMCommander();
    let spinner = ora();

    try {
      const context = await commander.runPipeline(input, (agent, status) => {
        if (status === "start") {
          spinner = ora(`${chalk.yellow(agent)} is working...`).start();
        } else {
          spinner.succeed(`${chalk.green(agent)} — done`);
        }
      });

      await saveOutput(context, opts.output);
      printSummary(context);
    } catch (err) {
      spinner.fail("Pipeline failed");
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

// ---- Single Agent Command ----
program
  .command("agent <name>")
  .description("Run a single agent: scout, strategist, or content")
  .requiredOption("-n, --name <name>", "Product name")
  .requiredOption("-d, --desc <description>", "Product description")
  .option("-u, --url <url>", "Product URL")
  .option("-c, --category <category>", "Product category")
  .option("-s, --stage <stage>", "Company stage")
  .option("-t, --target <audience>", "Target audience")
  .option("-l, --lang <language>", "Language market", "en")
  .option("--context <file>", "Path to existing GTM context JSON (for dependent agents)")
  .option("-o, --output <dir>", "Output directory", "output")
  .action(async (agentName: string, opts) => {
    if (!["scout", "strategist", "content"].includes(agentName)) {
      console.error(chalk.red(`Unknown agent: ${agentName}. Use: scout, strategist, or content`));
      process.exit(1);
    }

    const input = buildInput(opts);
    printHeader();
    console.log(chalk.cyan(`▸ Mode: Single Agent — ${agentName}`));
    console.log(chalk.cyan(`▸ Product: ${input.name}`));
    console.log();

    const commander = new GTMCommander();
    const spinner = ora(`${chalk.yellow(agentName)} is working...`).start();

    try {
      let existingContext: GTMContext | undefined;
      if (opts.context) {
        const raw = fs.readFileSync(opts.context, "utf-8");
        existingContext = JSON.parse(raw) as GTMContext;
      }

      const context = await commander.runSingleAgent(
        agentName as AgentName,
        input,
        existingContext
      );

      spinner.succeed(`${chalk.green(agentName)} — done`);
      await saveOutput(context, opts.output);
      printSummary(context);
    } catch (err) {
      spinner.fail(`${agentName} failed`);
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

// ---- Helpers ----

function buildInput(opts: Record<string, string>): ProductInput {
  return {
    name: opts.name,
    url: opts.url,
    description: opts.desc,
    category: opts.category,
    stage: opts.stage,
    targetAudience: opts.target,
    language: (opts.lang as ProductInput["language"]) || "en",
  };
}

function printHeader() {
  console.log();
  console.log(chalk.bold.blue("╔══════════════════════════════════════════╗"));
  console.log(chalk.bold.blue("║   AI Product GTM Co-Pilot  |  JE Labs   ║"));
  console.log(chalk.bold.blue("╚══════════════════════════════════════════╝"));
  console.log();
}

function printSummary(context: GTMContext) {
  console.log();
  console.log(chalk.bold("─── Results Summary ───"));

  if (context.scout) {
    console.log(chalk.yellow("\n[Scout]"));
    console.log(`  Competitors found: ${context.scout.competitors.length}`);
    console.log(`  User personas: ${context.scout.userPersonas.length}`);
    console.log(`  Market trends: ${context.scout.marketTrends.length}`);
  }

  if (context.strategist) {
    console.log(chalk.yellow("\n[Strategist]"));
    console.log(`  Headline: ${context.strategist.messagingFramework.headline}`);
    console.log(`  Channels: ${context.strategist.gtmPlan.channelPriorities.length} prioritized`);
    console.log(`  Launch days: ${context.strategist.launchPlaybook.length}`);
  }

  if (context.contentEngine) {
    console.log(chalk.yellow("\n[Content Engine]"));
    console.log(`  Assets generated: ${context.contentEngine.assets.length}`);
    context.contentEngine.assets.forEach((a) => {
      console.log(`    - ${a.platform}/${a.type}: ${a.title}`);
    });
  }

  console.log();
}

async function saveOutput(context: GTMContext, outputDir: string) {
  const dir = path.resolve(outputDir);
  fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `gtm-${context.input.name.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.json`;
  const filepath = path.join(dir, filename);

  fs.writeFileSync(filepath, JSON.stringify(context, null, 2));
  console.log(chalk.green(`\n✓ Full context saved to: ${filepath}`));

  // Save individual content assets as separate files for easy access
  if (context.contentEngine?.assets) {
    const contentDir = path.join(dir, "content");
    fs.mkdirSync(contentDir, { recursive: true });

    for (const asset of context.contentEngine.assets) {
      const assetFile = path.join(contentDir, `${asset.platform}-${asset.type}.txt`);
      fs.writeFileSync(assetFile, asset.content);
    }
    console.log(chalk.green(`✓ Content assets saved to: ${contentDir}/`));
  }
}

program.parse();
