declare module 'xss' {
  interface IWhiteList {
    [key: string]: string[];
  }

  interface ICSSFilter {
    whiteList?: IWhiteList;
  }

  interface IFilterXSSOptions {
    whiteList?: IWhiteList;
    onTag?: (tag: string, html: string, options: any) => string;
    onTagAttr?: (tag: string, name: string, value: string, isWhiteAttr: boolean) => string;
    onIgnoreTag?: (tag: string, html: string, options: any) => string;
    onIgnoreTagAttr?: (tag: string, name: string, value: string, isWhiteAttr: boolean) => string;
    safeAttrValue?: (tag: string, name: string, value: string, cssFilter: any) => string;
    escapeHtml?: (html: string) => string;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: boolean | string[];
    allowCommentTag?: boolean;
    stripBlankChar?: boolean;
    css?: boolean | ICSSFilter;
  }

  interface IFilterXSS {
    process(html: string): string;
  }

  function filterXSS(html: string, options?: IFilterXSSOptions): string;

  namespace filterXSS {
    export const whiteList: IWhiteList;
    export function FilterXSS(options?: IFilterXSSOptions): IFilterXSS;
  }

  export = filterXSS;
}
