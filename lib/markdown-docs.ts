import fs from "node:fs";
import path from "node:path";

export type MarkdownBlock =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; language: string; code: string };

export type MarkdownDocument = {
  slug: string;
  title: string;
  description: string;
  order: number;
  blocks: MarkdownBlock[];
  sections: Array<{ id: string; title: string }>;
};

const DOCS_DIR = path.join(process.cwd(), "docs", "documentation");

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseFrontmatter(raw: string) {
  if (!raw.startsWith("---\n")) return { attributes: {}, body: raw };

  const end = raw.indexOf("\n---", 4);
  if (end === -1) return { attributes: {}, body: raw };

  const attributes: Record<string, string> = {};
  const frontmatter = raw.slice(4, end).trim();
  for (const line of frontmatter.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match) attributes[match[1]] = match[2].trim();
  }

  const bodyStart = raw.indexOf("\n", end + 4);
  return { attributes, body: bodyStart === -1 ? "" : raw.slice(bodyStart + 1) };
}

function flushParagraph(lines: string[], blocks: MarkdownBlock[]) {
  if (!lines.length) return;
  blocks.push({ type: "paragraph", text: lines.join(" ").trim() });
  lines.length = 0;
}

function parseMarkdown(raw: string) {
  const { attributes, body } = parseFrontmatter(raw.replace(/\r\n/g, "\n"));
  const blocks: MarkdownBlock[] = [];
  const paragraph: string[] = [];
  const lines = body.split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraph, blocks);
      index += 1;
      continue;
    }

    const codeMatch = /^```(\w*)/.exec(trimmed);
    if (codeMatch) {
      flushParagraph(paragraph, blocks);
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", language: codeMatch[1] || "text", code: code.join("\n") });
      index += 1;
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph(paragraph, blocks);
      const text = headingMatch[2].trim();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text,
        id: slugify(text),
      });
      index += 1;
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    const orderedMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (unorderedMatch || orderedMatch) {
      flushParagraph(paragraph, blocks);
      const ordered = Boolean(orderedMatch);
      const items: string[] = [];
      while (index < lines.length) {
        const rawCurrent = lines[index];
        const current = rawCurrent.trim();
        const itemMatch = ordered
          ? /^\d+\.\s+(.+)$/.exec(current)
          : /^[-*]\s+(.+)$/.exec(current);
        if (!itemMatch) {
          if (/^\s{2,}\S/.test(rawCurrent) && items.length) {
            items[items.length - 1] = `${items[items.length - 1]} ${current}`;
            index += 1;
            continue;
          }
          break;
        }
        items.push(itemMatch[1].trim());
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    paragraph.push(trimmed);
    index += 1;
  }

  flushParagraph(paragraph, blocks);

  const firstHeading = blocks.find(
    (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
      block.type === "heading" && block.level === 1,
  );
  const firstParagraph = blocks.find(
    (block): block is Extract<MarkdownBlock, { type: "paragraph" }> =>
      block.type === "paragraph",
  );

  return {
    attributes,
    blocks,
    title: attributes.title || firstHeading?.text || "Documentation",
    description: attributes.description || firstParagraph?.text || "",
    sections: blocks
      .filter(
        (block): block is Extract<MarkdownBlock, { type: "heading" }> =>
          block.type === "heading" && block.level === 2,
      )
      .map((block) => ({ id: block.id, title: block.text })),
  };
}

export function getMarkdownDocuments(): MarkdownDocument[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  return fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
      const parsed = parseMarkdown(raw);
      const slug = file.replace(/\.md$/, "").replace(/^\d+-/, "");
      const order = Number.parseInt(parsed.attributes.order || "", 10);
      const blocks = parsed.blocks.map((block) =>
        block.type === "heading" && block.level > 1
          ? { ...block, id: `${slug}-${block.id}` }
          : block,
      );
      const sections = parsed.sections.map((section) => ({
        ...section,
        id: `${slug}-${section.id}`,
      }));
      return {
        slug,
        title: parsed.title,
        description: parsed.description,
        order: Number.isFinite(order) ? order : 999,
        blocks,
        sections,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}
