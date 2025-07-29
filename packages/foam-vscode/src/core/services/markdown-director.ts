import { ResourceParser } from '../model/note';
import { URI } from '../model/uri';
import { FoamParser, typePlugin } from './markdown-parser';

export abstract class MarkdownDirector {
  constructor(protected parserMap: Record<string, ResourceParser<any>>) {}

  /**
   * Parses the given Markdown into a Resource object using the appropriate parser.
   *
   * ⚠️ Be careful!
   * This method is **not fully type-safe** – the returned object type depends on dynamic runtime resolution.
   *
   * 🧠 Ideally, this problem would be solved using **variadic templates** or true **generic return-type inference**
   * based on runtime dispatch – as supported in languages like C++. If TypeScript ever introduces such capabilities,
   * this function should be refactored accordingly for full type safety.
   *
   * Until then: use with caution. Type guards or runtime checks are strongly recommended if you depend on specific fields.
   */
  parse(uri: URI, markdown: string): any {
    const type = this.resolveType(uri, markdown);
    const parser = this.parserMap[type];

    if (!parser) {
      throw new Error(`No parser for type '${type}'`);
    }
    return parser.parse(uri, markdown);
  }

  protected abstract resolveType(uri: URI, markdown: string): string;
}

export class FrontmatterMarkdownDirector extends MarkdownDirector {
  protected resolveType(uri: URI, markdown: string): string {
    const parser = new FoamParser<{ type: string }>(
      () => ({ type: '' }),
      typePlugin
    );
    var result = parser.parse(uri, markdown);
    if (result.type === '') {
      result.type = 'note';
    }

    return result.type;
  }
}
