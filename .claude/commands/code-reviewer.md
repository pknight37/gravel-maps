Review the code changes in the current branch (or staged/unstaged changes if no branch diff exists).

## Review Process

1. Identify all changed files using `git diff` (against the base branch, or HEAD for uncommitted changes).
2. Read each changed file in full to understand context.
3. Evaluate every change against the checklist below.
4. Report findings organized by severity: **Errors** > **Warnings** > **Suggestions**.
5. If no issues are found, confirm the code looks good.

## Checklist

### Structure & Complexity
- [ ] No functions longer than 30 lines (split if doing too much)
- [ ] No logic duplicated more than twice (extract to utility)
- [ ] No components with more than 3 props that could be grouped into an object

### Type Safety
- [ ] No `any` type usage in TypeScript (replace with real types)
- [ ] Zod schemas or explicit interfaces at system boundaries

### Error Handling
- [ ] All async operations have error handling (try/catch or .catch)
- [ ] User-facing errors produce visible feedback

### Security (from CLAUDE.md)
- [ ] No API keys, tokens, or credentials in code
- [ ] No `eval()`, `document.write()`, or `new Function()`
- [ ] All external URLs use `https://`
- [ ] User input is validated/sanitized at boundaries

### React Native / Expo Specific
- [ ] No inline styles that should be in StyleSheet
- [ ] Accessibility labels on interactive elements
- [ ] Touch targets >= 44px

### Testing
- [ ] New logic has corresponding tests (or a clear reason why not)
- [ ] Existing tests still pass

## Output Format

For each issue found:
```
[ERROR|WARNING|SUGGESTION] file:line — description
```

End with a summary: total errors, warnings, suggestions, and an overall verdict (APPROVE / REQUEST CHANGES).
