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
    // Use GFM-style heading IDs
    marked.use(gfmHeadingId());
  }

  private generateUniqueSlug(text: string, slugCounts: Record<string, number>): string {
    let slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w]+/g, '-')
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

    // Create a custom walker that collects headings for this specific parse
    const walkTokens = (tokens: any[]) => {
      tokens.forEach((token) => {
        if (token.type === 'heading') {
          const slug = this.generateUniqueSlug(token.text, slugCounts);
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

    // Use marked with custom extension
    const parser = new marked.Parser();
    const lexer = new marked.Lexer();
    const tokens = lexer.lex(markdown);
    walkTokens(tokens);

    const content = parser.parse(tokens);
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
