# Formatting Scope

ScolaOS uses Prettier as a deterministic code/manifests formatter, not as an automatic prose editor for long-form product documentation.

The formatting gate covers executable/shared source, tests, and workspace/root package manifests. Markdown architecture/PRD documents remain reviewed as authored content; ESLint, TypeScript, tests, and domain-specific checks provide code-quality enforcement.

Single-statement control-flow guards may omit braces only when the complete statement remains on one physical line. Multi-line control-flow bodies require braces, and mixed brace style within the same conditional chain is rejected. This matches the repository's established guard-clause style without disabling protection around multi-line edits.

This policy exists to keep CI signal focused: a planning-document wrapping preference must not prevent lint, typecheck, unit tests, build, or E2E gates from running.
