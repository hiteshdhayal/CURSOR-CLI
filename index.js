import { OpenAI } from "openai";
import dotenv from "dotenv";
import { exec } from "child_process";
import puppeteer from "puppeteer";
import fs from "fs/promises";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----------------------
// TOOL DEFINITIONS
// ----------------------
async function scrape_website(url = "") {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const content = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return content;
  } catch (error) {
    await browser.close();
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}

async function CODE(input = "", data = null, filepath = null) {
  // Case 1: Writing to file
  if (data && filepath) {
    try {
      await fs.writeFile(filepath, data, "utf-8");
      return `✅ File written: ${filepath}`;
    } catch (err) {
      return `❌ Error writing file ${filepath}: ${err.message}`;
    }
  }

  // Case 2: Running shell commands
  return new Promise((res) => {
    exec(input, (error, stdout, stderr) => {
      if (error) {
        res(`❌ Error running command: ${stderr || error.message}`);
      } else {
        res(`✅ Command executed: ${stdout || input}`);
      }
    });
  });
}

const TOOL_MAP = {
  scrape_website,
  CODE,
  code: CODE, // lowercase alias
};

// ----------------------
// MAIN LOGIC
// ----------------------
const link = process.argv[2];

async function main() {
  const SYSTEM_PROMPT = `You are an expert web developer AI assistant that creates functional clones of websites from URLs.

Your Mission:
When given a URL, analyze it, scrape its structure and content, and create a complete clone using modern web technologies (HTML, CSS, and JavaScript).

Core Process:
1. Analyze the target website (layout, content, styling)
2. Plan how to scrape it
3. Use scrape_website to extract content
4. Generate the code for a new website project
5. Use CODE to either run shell commands (create folders/files) or directly write code into files
6. Confirm the clone is ready

Strict Rules:
- ALWAYS respond in strict JSON compatible with response_format: { type: "json_object" }
- Follow the exact sequence: START → THINK → TOOL → OBSERVE → THINK → TOOL → … → OUTPUT
- Only perform one step at a time, wait for OBSERVE after each TOOL call
- Multiple THINK steps are encouraged for detailed reasoning
- Do NOT output explanations outside of JSON
- Do NOT invent new tools — only use available tools
- CODE has two modes:
  • If only "input" is provided → execute as a shell command
  • If "filepath" + "data" are provided → write "data" into the specified file
- Use scrape_website to extract the target website’s content

JSON Format (must match exactly):
{
  "step": "START|THINK|TOOL|OBSERVE|OUTPUT",
  "content": "description of what you are doing",
  "tool_name": "scrape_website|CODE",
  "input": "string input for the tool (used only for shell commands)",
  "filepath": "path to file (required only when writing code)",
  "data": "file contents (required only when writing code)"
}`;

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: link },
  ];

  let lastResponse = null;

  while (true) {
    const response = await client.chat.completions.create({
      model: "gpt-5",
      messages: messages,
      // max_tokens: 5000, // ✅ added token limit
    });

    const rawContent = response.choices[0].message.content;
    let parsedContent;
    try {
      parsedContent = JSON.parse(rawContent);
    } catch (e) {
      console.error("Invalid JSON from model:", rawContent);
      continue;
    }

    lastResponse = parsedContent;

    messages.push({
      role: "assistant",
      content: JSON.stringify(parsedContent),
    });

    if (parsedContent.step === "START") {
      console.log(`🔥`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "THINK") {
      console.log(`\t🧠`, parsedContent.content);
      continue;
    }

    if (parsedContent.step === "TOOL") {
      const toolToCall = parsedContent.tool_name;
      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: "developer",
          content: `There is no such tool as ${toolToCall}`,
        });
        continue;
      }

      const responseFromTool = await TOOL_MAP[toolToCall](
        parsedContent.input,
        parsedContent.data,
        parsedContent.filepath
      );

      console.log(
        `🛠️: ${toolToCall}(${parsedContent.input || parsedContent.filepath || ""}) = `,
        responseFromTool
      );

      messages.push({
        role: "developer",
        content: JSON.stringify({ step: "OBSERVE", content: responseFromTool }),
      });
      continue;
    }

    if (parsedContent.step === "OUTPUT") {
      console.log(`🤖`, parsedContent.content);
      break;
    }
  }

  console.log("Done...");
  console.log("Last AI response:", lastResponse);
}

main();
