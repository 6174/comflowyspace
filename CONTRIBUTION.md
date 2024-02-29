# Contribution

Thank you for considering contributing to Comflowy! We are actively looking for:

* Translation
* Bug fixes

## Translation

Our product's default language is English, but we plan to support multiple languages. Currently, we are planning to use AI tools to translate the text. However, errors may still occur. Therefore, we welcome everyone to join in the software localization process.  

Taking the product's Home page as an example, I will introduce how localization is implemented.

First, we need to locate the frontend code for this page. Our frontend code is all stored in this folder:`apps/electron-frontend/src/components`. In this folder, you can find the frontend code file for the Home page: `apps/electron-frontend/src/components/my-workflows/my-workflows.tsx`.

First, import the translation function and the translation key:

```tsx
import { KEYS, t } from "@comflowy/common/i18n"; 
```

Locate the text that needs to be localized:

```tsx
// ...
  return (
      <div className="workflow-create-box">
        <h2>Create New Workflow</h2> 
      </div>
    )
// ...
```

Then, set the key of this text into this file `packages/common/i18n/i18n-types.ts`:

```tsx
export const KEYS = {
  // ...
  createNewWorkflow: 'createNewWorkflow',
  // ...
};
```

Next, convert the string into the key:

```tsx
// ...
  return (
      <div className="workflow-create-box">
        <h2>{t(KEYS.createNewWorkflow)}</h2> 
      </div>
    )
// ...
```

Finally, open the localization text file: `packages/common/i18n/ALL_LANG.ts`. Add the translation key and the corresponding translation text to the file. For example:

```tsx
const ALLLang: i18nAllLang = {
  // ...
  [KEYS.createNewWorkflow]: {
    'en-US': 'Create New Workflow',
    'zh-CN': '创建新工作流',
    'ja': '新しいワークフローを作成'
  }
};
```

BTW if you find a typo, you can directly edit `ALL_LANG.ts` file.
