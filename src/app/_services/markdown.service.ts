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
    marked.use(gfmHeadingId(), {
      walkTokens: (token) => {
        if (token.type === 'heading') {
          const id = this.generateUniqueSlug(token.text);
          this.headings.push({
            text: token.text,
            level: token.depth,
            id,
          });
        }
      },
    });
  }

  private generateUniqueSlug(text: string): string {
    let slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (this.slugCounts[slug] === undefined) {
      this.slugCounts[slug] = 0;
    } else {
      this.slugCounts[slug]++;
      slug = `${slug}-${this.slugCounts[slug]}`;
    }

    return slug;
  }

  async parse(markdown: string, currentPath: string) {
    this.headings = [];
    this.slugCounts = {};

    const content = await marked(markdown);
    const toc = this.buildTOC(currentPath);

    return { content, toc };
  }

  private buildTOC(currentPath: string): string {
    if (!this.headings.length) return '';

    const tree = this.buildTOCTree(this.headings);
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
