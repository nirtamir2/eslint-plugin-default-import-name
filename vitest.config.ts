import { defineConfig } from 'vitest/config';

// eslint-disable-next-line import/no-unused-modules
export default defineConfig({
    test: {
        clearMocks: true,
        coverage: {
            all: true,
            exclude: ['lib'],
            include: ['src'],
            reporter: ['html', 'lcov']
        },
        exclude: ['lib', 'node_modules'],
        setupFiles: ['console-fail-test/setup', './src/tests/globalSetup.js']
    }
});
