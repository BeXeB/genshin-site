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

interface EntityReference {
  type: 'character' | 'weapon' | 'artifact';
  slug: string;
  href: string;
}

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private headings: Heading[] = [];
  private slugCounts: Record<string, number> = {};

  constructor() {
    // Plugin will be instantiated per-parse to reset state
  }

  /**
   * Extract entity information from image href
   * Returns entity reference if href points to a character/weapon/artifact image
   * Examples:
   * - assets/images/characters/linnea/icon.webp -> { type: 'character', slug: 'linnea' }
   * - assets/images/weapons/goldenfrostboundoath/awaken.webp -> { type: 'weapon', slug: 'goldenfrostboundoath' }
   * - assets/images/artifacts/aubadeofmorningstarandmoon/flower.webp -> { type: 'artifact', slug: 'aubadeofmorningstarandmoon' }
   */
  private extractEntityReference(href: string): EntityReference | null {
    const characterMatch = href.match(
      /assets\/images\/characters\/([^/]+)\//,
    );
    if (characterMatch) {
      const slug = characterMatch[1];
      return {
        type: 'character',
        slug,
        href: `/characters/${slug}`,
      };
    }

    const weaponMatch = href.match(/assets\/images\/weapons\/([^/]+)\//);
    if (weaponMatch) {
      const slug = weaponMatch[1];
      return {
        type: 'weapon',
        slug,
        href: `/weapons/${slug}`,
      };
    }

    const artifactMatch = href.match(/assets\/images\/artifacts\/([^/]+)\//);
    if (artifactMatch) {
      const slug = artifactMatch[1];
      return {
        type: 'artifact',
        slug,
        href: `/artifacts/${slug}`,
      };
    }

    return null;
  }

  /**
   * Preprocess markdown to handle custom [mix: ...] syntax
   * Converts [mix: ![ref1] ![ref2] ...] blocks to <div class="mix"> containers
   */
  public preprocessMarkdown(markdown: string): string {
    return markdown.replace(
      /\[mix:\s*((?:!\[[^\]]*\]\s*)+)\]/g,
      (match, content) => {
        const imageCount = (content.match(/!\[[^\]]*\]/g) || []).length;
        return `<div class="mix mix-${imageCount}">${content}</div>`;
      },
    );
  }

  private generateUniqueSlug(
    text: string,
    slugCounts: Record<string, number>,
  ): string {
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
    // Preprocess [mix: ...] blocks before passing to marked
    const processedMarkdown = this.preprocessMarkdown(markdown);

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
      const slug =
        generatedIds[rendererIdIndex++] ||
        this.generateUniqueSlug(text, slugCounts);
      return `<h${level} id="${slug}">${text}</h${level}>\n`;
    };

    renderer.image = (args: any) => {
      const href = args.href || args;
      const text = args.text || args;

      // Check if this image is a reference to an entity (character/weapon/artifact)
      const entityRef = this.extractEntityReference(href);

      // Check if text ends with a star rating (1-5) or element name
      const starMatch = text.match(/-(1|2|3|4|5)$/);
      const elementMatch = text.match(/-(p|h|a|e|d|c|g)$/);

      let imageHtml = '';

      if (starMatch) {
        const stars = starMatch[1];
        const starClassMap: Record<string, string> = {
          '5': 'five-star',
          '4': 'four-star',
          '3': 'three-star',
          '2': 'two-star',
          '1': 'one-star',
        };
        const starClass = starClassMap[stars];
        const altText = text.replace(/-(1|2|3|4|5)$/, '');
        imageHtml = `<div class="icon ${starClass}"><img src="${href}" alt="${altText}" /></div>`;
      } else if (elementMatch) {
        const element = elementMatch[1];
        const elementClassMap: Record<string, string> = {
          p: 'pyro',
          h: 'hydro',
          a: 'anemo',
          e: 'electro',
          d: 'dendro',
          c: 'cryo',
          g: 'geo',
        };
        const elementClass = elementClassMap[element];
        const altText = text.replace(/-(p|h|a|e|d|c|g)$/, '');
        imageHtml = `<div class="icon ${elementClass}"><img src="${href}" alt="${altText}" /></div>`;
      } else {
        imageHtml = `<img src="${href}" alt="${text}" />`;
      }

      // Wrap in link if this is an entity reference
      if (entityRef) {
        return `<a class="entity-link" data-entity-type="${entityRef.type}" data-entity-route="${entityRef.href}">${imageHtml}</a>`;
      }

      return imageHtml;
    };

    // Parse with fresh renderer context
    const tokens = marked.lexer(processedMarkdown);
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
