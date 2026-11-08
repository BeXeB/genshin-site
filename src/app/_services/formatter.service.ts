import { Injectable } from '@angular/core';
import {
  AstNode,
  ColorNode,
  LinkNode,
  LinkType,
  LineBreakNode,
  ItalicNode,
  BoldNode,
  TextNode,
  ParamNode,
} from '../_models/ast-nodes';

interface ParseState {
  index: number;
  // Closing tags of the currently open nodes, outermost first
  openEndTags: string[];
  // Closing tags of nodes that were closed by an ancestor's closing tag (mismatched nesting),
  // skipped when they appear later in the text
  displacedEndTags: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FormatterService {
  constructor() {}

  parse(text: string | undefined): AstNode[] {
    if (!text) {
      return [];
    }

    const state: ParseState = {
      index: 0,
      openEndTags: [],
      displacedEndTags: [],
    };

    return this.parseNodes(text, state);
  }

  private parseNodes(text: string, state: ParseState, endTag?: string): AstNode[] {
    const nodes: AstNode[] = [];

    if (endTag) {
      state.openEndTags.push(endTag);
    }

    while (state.index < text.length) {
      if (endTag && text.startsWith(endTag, state.index)) {
        state.index += endTag.length;
        break;
      }

      // Mismatched nesting, e.g. <color>{LINK#...}text</color>{/LINK}: end this node without consuming
      // the ancestor's closing tag, and skip this node's own closing tag when it appears later
      if (endTag && this.findClosingTag(text, state.index, state.openEndTags)) {
        state.displacedEndTags.push(endTag);
        break;
      }

      const displacedTag = this.findClosingTag(text, state.index, state.displacedEndTags);
      if (displacedTag) {
        state.displacedEndTags.splice(state.displacedEndTags.indexOf(displacedTag), 1);
        state.index += displacedTag.length;
        continue;
      }

      if (text.startsWith('<color=', state.index)) {
        nodes.push(this.parseColor(text, state));
        continue;
      }

      if (text.startsWith('<i>', state.index)) {
        nodes.push(this.parseItalic(text, state));
        continue;
      }

      if (text.startsWith('<b>', state.index)) {
        nodes.push(this.parseBold(text, state));
        continue;
      }

      if (text.startsWith('{LINK#', state.index)) {
        const link = this.parseLink(text, state);
        if (link) {
          nodes.push(link);
        } else {
          // Malformed link - treat { as text and move forward to avoid infinite loop
          state.index++;
        }
        continue;
      }

      if (text.startsWith('{PARAM#', state.index)) {
        nodes.push(this.parseParam(text, state));
        continue;
      }

      if (text.startsWith('{LAYOUT_', state.index)) {
        const layoutNode = this.parseLayout(text, state);
        if (layoutNode) {
          nodes.push(layoutNode);
        }
        continue;
      }

      if (text[state.index] === '\n') {
        nodes.push({
          type: 'lineBreak',
        } satisfies LineBreakNode);

        state.index++;
        continue;
      }

      nodes.push(this.parseText(text, state));
    }

    if (endTag) {
      state.openEndTags.pop();
    }

    return nodes;
  }

  private findClosingTag(text: string, index: number, closingTags: string[]): string | undefined {
    return closingTags.find((closingTag) => text.startsWith(closingTag, index));
  }

  private parseText(text: string, state: ParseState): TextNode {
    const start = state.index;

    while (
      state.index < text.length &&
      !text.startsWith('<color=', state.index) &&
      !text.startsWith('{LINK#', state.index) &&
      !text.startsWith('{PARAM#', state.index) &&
      !text.startsWith('{LAYOUT_', state.index) &&
      !text.startsWith('<i>', state.index) &&
      !text.startsWith('<b>', state.index) &&
      text[state.index] !== '\n' &&
      !text.startsWith('</color>', state.index) &&
      !text.startsWith('</i>', state.index) &&
      !text.startsWith('</b>', state.index) &&
      !text.startsWith('{/LINK}', state.index)
    ) {
      state.index++;
    }

    const textContent = text.substring(start, state.index);

    // If we parsed nothing but encountered an unexpected closing tag, treat it as text
    // and advance past it to avoid infinite loops
    if (textContent.length === 0 && state.index < text.length) {
      if (
        text.startsWith('</b>', state.index) ||
        text.startsWith('</i>', state.index) ||
        text.startsWith('</color>', state.index) ||
        text.startsWith('{/LINK}', state.index)
      ) {
        // Consume the unexpected closing tag as text
        let tagEnd = state.index + 1;
        while (tagEnd < text.length && text[tagEnd] !== '>') {
          tagEnd++;
        }
        if (tagEnd < text.length) {
          tagEnd++;
        }
        state.index = tagEnd;
        return {
          type: 'text',
          text: text.substring(start, state.index),
        };
      }
    }

    return {
      type: 'text',
      text: textContent,
    };
  }

  private parseColor(text: string, state: ParseState): ColorNode {
    const end = text.indexOf('>', state.index);

    const tag = text.substring(state.index, end + 1);

    const match = tag.match(/<color="?([^">]+)"?>/);

    if (!match) {
      throw new Error(`Invalid color tag: ${tag}`);
    }

    state.index = end + 1;

    return {
      type: 'color',
      color: match[1],
      children: this.parseNodes(text, state, '</color>'),
    };
  }

  private parseLink(text: string, state: ParseState): LinkNode | null {
    const end = text.indexOf('}', state.index);

    // If no closing brace found, treat as text to avoid infinite loop
    if (end === -1) {
      return null;
    }

    const tag = text.substring(state.index, end + 1);

    // Match patterns: {LINK#N123}, {LINK#Zcharacter-field}, {LINK#elemental-mastery}
    const match = tag.match(/\{LINK#(?:([NSPT])(\d+)|Z([a-z0-9\-]+)|([a-z0-9\-]+))\}/);

    // If tag doesn't match valid link format, treat as text to avoid infinite loop
    if (!match) {
      return null;
    }

    let type: LinkType;
    let id: string | number;

    // Match groups: [1]=type letter, [2]=numeric id, [3]=Z id, [4]=custom string id
    if (match[1]) {
      // Type N/S/P/T with numeric ID
      type = match[1] as LinkType;
      id = Number(match[2]);
    } else if (match[3]) {
      // Type Z with string ID
      type = 'Z';
      id = match[3];
    } else {
      // Custom string ID (default type C)
      type = 'C';
      id = match[4];
    }

    state.index = end + 1;

    const children = this.parseNodes(text, state, '{/LINK}');

    if (children.length === 0) {
      return null;
    }

    return {
      type: 'link',
      id,
      linkType: type,
      children,
    };
  }

  private parseParam(text: string, state: ParseState): ParamNode {
    const end = text.indexOf('}', state.index);

    const tag = text.substring(state.index, end + 1);

    const match = tag.match(/\{PARAM#P(\d+)\|(\d+)S(\d+)\}/);

    if (!match) {
      throw new Error(`Invalid param tag: ${tag}`);
    }

    const idStr = match[1];
    const groupId = Number(idStr.slice(0, -2));
    const level = Number(idStr.slice(-2));
    const paramIndex = Number(match[2]);
    const multiplier = Number(match[3]);

    state.index = end + 1;

    return {
      type: 'param',
      groupId,
      level,
      paramIndex,
      multiplier,
    };
  }

  private parseLayout(text: string, state: ParseState): TextNode | null {
    // Match pattern: {LAYOUT_MOBILE#...}{LAYOUT_PC#...}{LAYOUT_PS#...}
    // Extract the MOBILE variant and lowercase first letter

    const remainingText = text.substring(state.index);

    // Match the full sequence of all three LAYOUT tags
    const layoutPattern = /\{LAYOUT_MOBILE#([^}]*)\}\{LAYOUT_PC#([^}]*)\}\{LAYOUT_PS#([^}]*)\}/;
    const match = remainingText.match(layoutPattern);

    if (!match) {
      return null;
    }

    let mobileText = match[1]; // Extract MOBILE variant

    // Move index past all three LAYOUT tags
    state.index += match[0].length;

    return {
      type: 'text',
      text: mobileText,
    };
  }

  private parseItalic(text: string, state: ParseState): ItalicNode {
    state.index += '<i>'.length;

    return {
      type: 'italic',
      children: this.parseNodes(text, state, '</i>'),
    };
  }

  private parseBold(text: string, state: ParseState): BoldNode {
    state.index += '<b>'.length;

    return {
      type: 'bold',
      children: this.parseNodes(text, state, '</b>'),
    };
  }
}
