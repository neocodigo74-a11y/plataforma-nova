import PizZip from "pizzip";

export function extractPlaceholders(buffer: Buffer): string[] {
  const zip = new PizZip(buffer);
  const xml = zip.file("word/document.xml")?.asText() || "";
  const matches = xml.match(/\{([^{}]+)\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, "").trim().toUpperCase()))];
}
