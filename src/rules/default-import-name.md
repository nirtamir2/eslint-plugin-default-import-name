# Enforce default imports matching file names (`default-import-name/default-import-name`)

🔧 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix).

<!-- end auto-generated rule header -->

## Options

<!-- begin auto-generated rule options list -->

| Name                   | Description                                                                     |
| :--------------------- | :------------------------------------------------------------------------------ |
| `ignoredSourceRegexes` | List of regexes to ignore import sources                                        |
| `mapImportPathToName`  | Object mapping import path regex to import name template based on the file name |

<!-- end auto-generated rule options list -->

## `mapImportPathToName`

The `mapImportPathToName` option allows you to define custom mappings between import paths and import names using string templates. This is useful for enforcing consistent naming conventions across your codebase.

### Default Configuration

By default, the rule includes these mappings:

```json
{
  "mapImportPathToName": {
    // Default mapping for files with kebab-case
    ".*/[a-z0-9]+(-[a-z0-9]+)+(.[a-z0-9]+)?$": "${value|camelcase}",
    // Astro files
    ".*.astro": "${value|pascalcase}",
    // React files
    ".*.tsx": "${value|pascalcase}",
    // CSS files
    ".*.css": "styles",
    // SVG files
    ".*.svg": "${value|camelcase}Src"
  }
}
```

### String Template Format

The string template format supports:

- `${value}` - The original file name without extension
- Pipes for transformations:
  - `pascalcase` - Convert to PascalCase
  - `camelcase` - Convert to camelCase
  - `snakecase` - Convert to snake_case
  - `uppercase` - Convert to UPPERCASE
  - `lowercase` - Convert to lowercase

### Examples

#### Basic File Name Matching

```typescript
import user from "./user.ts"; // ✅ Correct
import Account from "./user.ts"; // ❌ Incorrect
```

#### Kebab-case to camelCase (Default)

```typescript
import getUser from "./get-user.ts"; // ✅ Correct
import user from "./get-user.ts"; // ❌ Incorrect
```

#### Custom Mapping Examples

1. **SVG Files with Icon Suffix**

```json
{
  "mapImportPathToName": {
    "\\.svg$": "${value|pascalcase}Icon"
  }
}
```

```typescript
// File: logo.svg
import LogoIcon from "./logo.svg"; // ✅ Correct
import logo from "./logo.svg"; // ❌ Incorrect
```

2. **Constants in UPPER_SNAKE_CASE**

```json
{
  "mapImportPathToName": {
    "\\/constants\\/.*\\.ts$": "${value|snakecase|uppercase}"
  }
}
```

```typescript
// File: constants/user-config.ts
import USER_CONFIG from "./constants/user-config.ts"; // ✅ Correct
import userConfig from "./constants/user-config.ts"; // ❌ Incorrect
```

3. **Service Files with Suffix**

```json
{
  "mapImportPathToName": {
    ".*\\.ts$": "${value|pascalcase}Service"
  }
}
```

```typescript
// File: user.ts
import UserService from "./user.ts"; // ✅ Correct
import user from "./user.ts"; // ❌ Incorrect
```

4. **React Hooks with use Prefix**

```json
{
  "mapImportPathToName": {
    ".*\\.ts$": "use${value|pascalcase}"
  }
}
```

```typescript
// File: user.ts
import useUser from "./user.ts"; // ✅ Correct
import user from "./user.ts"; // ❌ Incorrect
```

5. **Multiple Transformations**

```json
{
  "mapImportPathToName": {
    "get-.*\\.ts$": "${value|snakecase|uppercase}"
  }
}
```

```typescript
// File: get-user.ts
import GET_USER from "./get-user.ts"; // ✅ Correct
import user from "./get-user.ts"; // ❌ Incorrect
```

### Multiple Patterns

When multiple patterns match a file, the last will be used. For example:

```json
{
  "mapImportPathToName": {
    ".*\\.ts$": "notUse{value|pascalcase}",
    "get-.*\\.ts$": "use${value|pascalcase}"
  }
}
```

```typescript
// File: get-user.ts
import useGetUser from "./hooks/get-user.ts"; // ✅ Correct
import getUser from "./hooks/get-user.ts"; // ❌ Incorrect
```
