import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';

interface Heading {
  text: string;
  level: number;
  id: string;
}

interface TOCNode {
  text: string;
  id: string;
  level: number;
  children: TOCNode[];
}

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private headings: Heading[] = [];
  private slugCounts: Record<string, number> = {};

  constructor() {
    // Plugin will be instantiated per-parse to reset state
  }

  private generateUniqueSlug(text: string, slugCounts: Record<string, number>): string {
    // Allow Unicode letters/numbers so accents (e.g. ó) are preserved in slugs
    let slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}_]+/gu, '-')
      .replace(/^-+|-+$/g, '');

    if (slugCounts[slug] === undefined) {
      slugCounts[slug] = 0;
    } else {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    }

    return slug;
  }

  async parse(markdown: string, currentPath: string) {
    // Local state for this parse operation to prevent race conditions
    const headings: Heading[] = [];
    const slugCounts: Record<string, number> = {};
    const generatedIds: string[] = [];
    let rendererIdIndex = 0;

    // Create a custom walker that collects headings and generates ids once
    const walkTokens = (tokens: any[]) => {
      tokens.forEach((token) => {
        if (token.type === 'heading') {
          const slug = this.generateUniqueSlug(token.text, slugCounts);
          generatedIds.push(slug);
          headings.push({
            text: token.text,
            level: token.depth,
            id: slug,
          });
        }
        if (token.tokens) {
          walkTokens(token.tokens);
        }
      });
    };

    // Use marked with a per-parse renderer that consumes pre-generated ids in order
    const renderer = new marked.Renderer();
    renderer.heading = (args: any) => {
      const text = args.text || args;
      const level = args.depth || args;
      const slug = generatedIds[rendererIdIndex++] || this.generateUniqueSlug(text, slugCounts);
      return `<h${level} id="${slug}">${text}</h${level}>\n`;
    };

    renderer.image = (args: any) => {
      const href = args.href || args;
      const text = args.text || args;

      // Check if text ends with a star rating (1-5) or element name
      const starMatch = text.match(/-(1|2|3|4|5)$/);
      const elementMatch = text.match(/-(pyro|hydro|anemo|electro|dendro|cryo|geo)$/);

      if (starMatch) {
        const stars = starMatch[1];
        const starClassMap: Record<string, string> = {
          '5': 'five-star',
          '4': 'four-star',
          '3': 'three-star',
          '2': 'two-star',
          '1': 'one-star'
        };
        const starClass = starClassMap[stars];
        const altText = text.replace(/-(1|2|3|4|5)$/, '');
        return `<div class="icon ${starClass}"><img src="${href}" alt="${altText}" /></div>`;
      } else if (elementMatch) {
        const element = elementMatch[1];
        const altText = text.replace(/-(pyro|hydro|anemo|electro|dendro|cryo|geo)$/, '');
        return `<div class="icon ${element}"><img src="${href}" alt="${altText}" /></div>`;
      }

      return `<img src="${href}" alt="${text}" />`;
    };

    // Parse with fresh renderer context
    const tokens = marked.lexer(markdown);
    walkTokens(tokens);
    const content = marked.parser(tokens, { renderer });

    const toc = this.buildTOC(headings, currentPath);

    return { content, toc };
  }

  private buildTOC(headings: Heading[], currentPath: string): string {
    if (!headings.length) return '';

    const tree = this.buildTOCTree(headings);
    const html = this.renderTOCTree(tree, currentPath);
    return `<nav class="toc">${html}</nav>`;
  }

  private buildTOCTree(headings: Heading[]): TOCNode[] {
    const root: TOCNode[] = [];
    const stack: TOCNode[] = [];

    headings.forEach((h) => {
      const node: TOCNode = { ...h, children: [] };

      while (stack.length && h.level <= stack[stack.length - 1].level) {
        stack.pop();
      }

      if (stack.length === 0) {
        root.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    });

    return root;
  }

  private renderTOCTree(nodes: TOCNode[], currentPath: string): string {
    if (!nodes.length) return '';

    const items = nodes
      .map(
        (node) => `
      <li class="toc-level-${node.level}">
        <a href="${currentPath}#${node.id}" class="toc-link">${node.text}</a>
        ${this.renderTOCTree(node.children, currentPath)}
      </li>`,
      )
      .join('');

    return `<ul>${items}</ul>`;
  }
}
