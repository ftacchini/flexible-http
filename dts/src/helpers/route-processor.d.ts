import { Key, Token, Path, TokensToRegexpOptions, ParseOptions } from "path-to-regexp";
export declare class RouteProcessor {
    pathToRegexp(path: Path, keys?: Key[] | null, options?: TokensToRegexpOptions & ParseOptions): RegExp;
    parse(str: string, options?: ParseOptions): Token[];
    call(path: Path, keys?: Key[], options?: TokensToRegexpOptions & ParseOptions): RegExp;
}
