// Script to parse PDF and create chunks using unpdf
const fs = require("fs");
const path = require("path");

const PDF_PATH = path.join(__dirname, "../public/research/ssrn-5381648-dynamic.pdf");
const OUTPUT_PATH = path.join(__dirname, "../src/data/research-chunks.json");

async function main() {
  const { extractText } = await import("unpdf");
  
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const uint8Array = new Uint8Array(pdfBuffer);
  const { text, totalPages } = await extractText(uint8Array);

  // Text is an array of strings (one per page)
  const fullText = Array.isArray(text) ? text.join("\n\n") : String(text);

  console.log(`PDF pages: ${totalPages}`);
  console.log(`Total characters: ${fullText.length}`);

  // Clean the text
  let cleanedText = fullText
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/ {3,}/g, "  ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Split into paragraphs
  const paragraphs = cleanedText.split(/\n\s*\n/).filter(p => p.trim().length > 30);

  // Chunk paragraphs into groups of ~2000 characters
  const TARGET_CHUNK_SIZE = 2000;
  const chunks = [];
  let currentChunk = "";
  let currentSection = "Introduction";

  for (const para of paragraphs) {
    const trimmed = para.trim();

    // Detect section headers
    const lines = trimmed.split("\n");
    const possibleHeader = lines[0]?.trim();
    if (possibleHeader && possibleHeader.length < 100 && possibleHeader.length > 5) {
      const headerLower = possibleHeader.toLowerCase();
      if (
        headerLower.includes("abstract") ||
        headerLower.includes("introduction") ||
        headerLower.includes("methodology") ||
        headerLower.includes("method") ||
        headerLower.includes("results") ||
        headerLower.includes("conclusion") ||
        headerLower.includes("discussion") ||
        headerLower.includes("summary") ||
        headerLower.includes("references") ||
        headerLower.includes("appendix") ||
        headerLower.match(/^[0-9]+[\.\)]\s/)
      ) {
        currentSection = possibleHeader.replace(/^[0-9]+[\.\)]\s*/, "").trim();
      }
    }

    if ((currentChunk + "\n\n" + trimmed).length > TARGET_CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        id: chunks.length + 1,
        section: currentSection,
        content: currentChunk.trim(),
        charCount: currentChunk.trim().length,
      });
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + trimmed : trimmed;
    }
  }

  // Push remaining
  if (currentChunk.trim().length > 0) {
    chunks.push({
      id: chunks.length + 1,
      section: currentSection,
      content: currentChunk.trim(),
      charCount: currentChunk.trim().length,
    });
  }

  console.log(`\nCreated ${chunks.length} chunks`);
  chunks.forEach((c) => {
    console.log(`  Chunk ${c.id}: "${c.section}" (${c.charCount} chars, ~${Math.ceil(c.charCount / 4)} tokens)`);
  });

  // Create the output directory if it doesn't exist
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(chunks, null, 2));
  console.log(`\nWritten to ${OUTPUT_PATH}`);
}

main().catch(console.error);
