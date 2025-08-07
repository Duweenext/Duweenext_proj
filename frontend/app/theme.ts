// src/theme.ts
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config';  // adjust the path if needed

// This gives you the default theme + all of your `extend` customizations:
const fullConfig = resolveConfig(tailwindConfig as any);

export const theme = fullConfig.theme as any;
