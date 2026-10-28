import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

// Build setup added on top of the 2026-10-04 export so the kb renders as the desk sees it.
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: './src/lib/layouts/runbook.svelte' } })],
  kit: {
    adapter: adapter({ fallback: undefined }),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['*'], handleHttpError: 'warn' },
  },
};
