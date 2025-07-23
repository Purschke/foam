import { ResourceParser } from '../model/note';
import { URI } from '../model/uri';
import { FoamParser, typePlugin } from './markdown-parser';

abstract class MarkdownDirector {
  constructor(protected parserMap: Record<string, ResourceParser<any>>) {}

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

class FrontmatterMarkdownDirector extends MarkdownDirector {
  protected resolveType(uri: URI, markdown: string): string {
    const parser = new FoamParser<{ type: string }>(
      () => ({ type: '' }),
      typePlugin
    );
    var result = parser.parse(uri, markdown);
    return result.type ?? 'note';
  }
}
