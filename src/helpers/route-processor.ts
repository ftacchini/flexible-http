import { pathToRegexp, parse, Key, Token, Path, TokensToRegexpOptions, ParseOptions } from "path-to-regexp";

/**
 * Wrapper class for path-to-regexp functions to maintain compatibility
 * with the original PathToRegex namespace API from v3.
 *
 * This allows dependency injection and mocking while providing both
 * the main pathToRegexp function and the parse utility.
 */
export class RouteProcessor {

    /**
     * Compile a path string into a regular expression.
     * @param path - The path pattern to compile
     * @param keys - Optional array to populate with parameter keys (can be null or undefined)
     * @param options - Optional compilation options
     * @returns A RegExp that can be used to match paths
     */
    public pathToRegexp(path: Path, keys?: Key[] | null, options?: TokensToRegexpOptions & ParseOptions): RegExp {
        // path-to-regexp v6 doesn't accept null, convert to undefined
        return pathToRegexp(path, keys || undefined, options);
    }

    /**
     * Parse a path string into tokens.
     * @param str - The path string to parse
     * @param options - Optional parsing options
     * @returns An array of tokens representing the path structure
     */
    public parse(str: string, options?: ParseOptions): Token[] {
        return parse(str, options);
    }

    /**
     * Call the route processor as a function (for backward compatibility).
     * This allows the class instance to be called like: routeProcessor(path, keys, options)
     */
    public call(path: Path, keys?: Key[], options?: TokensToRegexpOptions & ParseOptions): RegExp {
        return this.pathToRegexp(path, keys, options);
    }
}
