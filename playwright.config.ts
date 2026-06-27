import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testDir: 'e2e',
	// Pin the OS color-scheme so theme assertions are deterministic (the app now defaults to
	// the OS preference; dark keeps `data-theme="dark"` as the baseline the specs expect).
	use: { colorScheme: 'dark' }
});
