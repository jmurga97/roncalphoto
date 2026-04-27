import type { ReactNode } from "react";

type AllowedTag = "a" | "b" | "br" | "em" | "h2" | "h3" | "i" | "li" | "ol" | "p" | "strong" | "ul";

interface ParsedTextNode {
  type: "text";
  value: string;
}

interface ParsedTagNode {
  children: ParsedNode[];
  href?: string;
  tag: AllowedTag;
  type: "tag";
}

interface ParsedRootNode {
  children: ParsedNode[];
  type: "root";
}

type ParsedNode = ParsedRootNode | ParsedTagNode | ParsedTextNode;

export type RichTextInline =
  | { type: "break" }
  | { type: "emphasis"; children: RichTextInline[] }
  | { type: "link"; children: RichTextInline[]; href: string }
  | { type: "strong"; children: RichTextInline[] }
  | { type: "text"; value: string };

export type RichTextBlock =
  | { type: "heading-2"; children: RichTextInline[] }
  | { type: "heading-3"; children: RichTextInline[] }
  | { items: RichTextInline[][]; type: "ordered-list" | "unordered-list" }
  | { type: "paragraph"; children: RichTextInline[] };

export type RichTextDocument = RichTextBlock[];

const TOKEN_REGEX = /<!--[\s\S]*?-->|<\/?[a-zA-Z0-9]+(?:\s[^>]*?)?\/?>|[^<]+/g;
const ALLOWED_TAGS = new Set<AllowedTag>([
  "a",
  "b",
  "br",
  "em",
  "h2",
  "h3",
  "i",
  "li",
  "ol",
  "p",
  "strong",
  "ul",
]);
const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (entity, code) => {
    const normalizedCode = code.toLowerCase();

    if (normalizedCode in ENTITY_MAP) {
      return ENTITY_MAP[normalizedCode];
    }

    if (normalizedCode.startsWith("#x")) {
      const codePoint = Number.parseInt(normalizedCode.slice(2), 16);
      return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
    }

    if (normalizedCode.startsWith("#")) {
      const codePoint = Number.parseInt(normalizedCode.slice(1), 10);
      return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
    }

    return entity;
  });
}

function readTagName(token: string): AllowedTag | null {
  const match = token.match(/^<\/?\s*([a-zA-Z0-9]+)/);
  const tagName = match?.[1]?.toLowerCase();

  if (!tagName || !ALLOWED_TAGS.has(tagName as AllowedTag)) {
    return null;
  }

  return tagName as AllowedTag;
}

function readHref(token: string) {
  const quotedHref = token.match(/\shref\s*=\s*(['"])(.*?)\1/i)?.[2];

  if (quotedHref) {
    return decodeHtmlEntities(quotedHref.trim());
  }

  const unquotedHref = token.match(/\shref\s*=\s*([^\s>]+)/i)?.[1];
  return unquotedHref ? decodeHtmlEntities(unquotedHref.trim()) : "#";
}

function tokenizeRichText(html: string): ParsedRootNode {
  const root: ParsedRootNode = { type: "root", children: [] };
  const stack: Array<ParsedRootNode | ParsedTagNode> = [root];

  for (const token of html.match(TOKEN_REGEX) ?? []) {
    if (token.startsWith("<!--")) {
      continue;
    }

    if (!token.startsWith("<")) {
      const decodedText = decodeHtmlEntities(token);

      if (decodedText.length > 0) {
        stack.at(-1)?.children.push({ type: "text", value: decodedText });
      }

      continue;
    }

    const tag = readTagName(token);

    if (!tag) {
      continue;
    }

    if (token.startsWith("</")) {
      while (stack.length > 1) {
        const currentNode = stack.pop();

        if (currentNode?.type === "tag" && currentNode.tag === tag) {
          break;
        }
      }

      continue;
    }

    const nextNode: ParsedTagNode = {
      type: "tag",
      tag,
      href: tag === "a" ? readHref(token) : undefined,
      children: [],
    };

    stack.at(-1)?.children.push(nextNode);

    const isSelfClosing = tag === "br" || token.endsWith("/>");

    if (!isSelfClosing) {
      stack.push(nextNode);
    }
  }

  return root;
}

function collapseInlineNodes(nodes: RichTextInline[]) {
  const collapsedNodes: RichTextInline[] = [];

  for (const node of nodes) {
    const previousNode = collapsedNodes.at(-1);

    if (node.type === "text" && previousNode?.type === "text") {
      previousNode.value += node.value;
      continue;
    }

    collapsedNodes.push(node);
  }

  return collapsedNodes;
}

function toInlineNodes(nodes: ParsedNode[]): RichTextInline[] {
  const inlineNodes: RichTextInline[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      inlineNodes.push({ type: "text", value: node.value });
      continue;
    }

    if (node.type !== "tag") {
      continue;
    }

    switch (node.tag) {
      case "a":
        inlineNodes.push({
          type: "link",
          href: node.href ?? "#",
          children: collapseInlineNodes(toInlineNodes(node.children)),
        });
        break;
      case "b":
      case "strong":
        inlineNodes.push({
          type: "strong",
          children: collapseInlineNodes(toInlineNodes(node.children)),
        });
        break;
      case "br":
        inlineNodes.push({ type: "break" });
        break;
      case "em":
      case "i":
        inlineNodes.push({
          type: "emphasis",
          children: collapseInlineNodes(toInlineNodes(node.children)),
        });
        break;
      default:
        inlineNodes.push(...toInlineNodes(node.children));
        break;
    }
  }

  return collapseInlineNodes(inlineNodes);
}

function sanitizeParagraphChildren(children: RichTextInline[]) {
  const hasTextContent = children.some((child) => {
    if (child.type !== "text") {
      return true;
    }

    return child.value.trim().length > 0;
  });

  const fallbackTextNode: RichTextInline = { type: "text", value: "" };
  return hasTextContent ? children : [fallbackTextNode];
}

function toListItems(node: ParsedTagNode) {
  const items = node.children
    .filter(
      (childNode): childNode is ParsedTagNode => childNode.type === "tag" && childNode.tag === "li",
    )
    .map((childNode) => sanitizeParagraphChildren(toInlineNodes(childNode.children)));

  if (items.length > 0) {
    return items;
  }

  const fallbackItem = sanitizeParagraphChildren(toInlineNodes(node.children));
  return fallbackItem.length > 0 ? [fallbackItem] : [];
}

export function parseRichText(html: string): RichTextDocument {
  const parsedTree = tokenizeRichText(html);
  const blocks: RichTextBlock[] = [];
  const emptyParagraphChildren: RichTextInline[] = [{ type: "text", value: "" }];

  for (const node of parsedTree.children) {
    if (node.type === "text") {
      if (node.value.trim().length === 0) {
        continue;
      }

      blocks.push({
        type: "paragraph",
        children: sanitizeParagraphChildren([{ type: "text", value: node.value }]),
      });
      continue;
    }

    if (node.type !== "tag") {
      continue;
    }

    switch (node.tag) {
      case "h2":
        blocks.push({
          type: "heading-2",
          children: sanitizeParagraphChildren(toInlineNodes(node.children)),
        });
        break;
      case "h3":
        blocks.push({
          type: "heading-3",
          children: sanitizeParagraphChildren(toInlineNodes(node.children)),
        });
        break;
      case "ol":
        blocks.push({
          type: "ordered-list",
          items: toListItems(node),
        });
        break;
      case "ul":
        blocks.push({
          type: "unordered-list",
          items: toListItems(node),
        });
        break;
      case "p":
        blocks.push({
          type: "paragraph",
          children: sanitizeParagraphChildren(toInlineNodes(node.children)),
        });
        break;
      default:
        blocks.push({
          type: "paragraph",
          children: sanitizeParagraphChildren(toInlineNodes([node])),
        });
        break;
    }
  }

  return blocks.length > 0 ? blocks : [{ type: "paragraph", children: emptyParagraphChildren }];
}

function renderInlineNode(node: RichTextInline, key: string): ReactNode {
  switch (node.type) {
    case "break":
      return <br key={key} />;
    case "emphasis":
      return (
        <em key={key}>
          {node.children.map((child, index) => renderInlineNode(child, `${key}-${index}`))}
        </em>
      );
    case "link":
      return (
        <a href={node.href} key={key} rel="noreferrer" target="_blank">
          {node.children.map((child, index) => renderInlineNode(child, `${key}-${index}`))}
        </a>
      );
    case "strong":
      return (
        <strong key={key}>
          {node.children.map((child, index) => renderInlineNode(child, `${key}-${index}`))}
        </strong>
      );
    case "text":
      return node.value;
  }
}

function renderInlineChildren(children: RichTextInline[], key: string) {
  return children.map((child, index) => renderInlineNode(child, `${key}-${index}`));
}

function stringifyInlineNodes(nodes: RichTextInline[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "break":
          return "__break__";
        case "emphasis":
          return `em(${stringifyInlineNodes(node.children)})`;
        case "link":
          return `link(${node.href})[${stringifyInlineNodes(node.children)}]`;
        case "strong":
          return `strong(${stringifyInlineNodes(node.children)})`;
        case "text":
          return node.value;
      }
    })
    .join("");
}

export function RichTextRenderer({ document }: { document: RichTextDocument }) {
  return document.map((block, index) => {
    const key = `description-${index}`;

    switch (block.type) {
      case "heading-2":
        return <h2 key={key}>{renderInlineChildren(block.children, key)}</h2>;
      case "heading-3":
        return <h3 key={key}>{renderInlineChildren(block.children, key)}</h3>;
      case "ordered-list":
        return (
          <ol key={key}>
            {block.items.map((item) => {
              const itemKey = `${key}-item-${stringifyInlineNodes(item)}`;

              return <li key={itemKey}>{renderInlineChildren(item, itemKey)}</li>;
            })}
          </ol>
        );
      case "paragraph":
        return <p key={key}>{renderInlineChildren(block.children, key)}</p>;
      case "unordered-list":
        return (
          <ul key={key}>
            {block.items.map((item) => {
              const itemKey = `${key}-item-${stringifyInlineNodes(item)}`;

              return <li key={itemKey}>{renderInlineChildren(item, itemKey)}</li>;
            })}
          </ul>
        );
    }
  });
}
