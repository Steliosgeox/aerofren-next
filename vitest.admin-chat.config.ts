import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: [
            'src/__tests__/adminChat/**/*.test.ts',
            'src/__tests__/incident/chatRouteContract.test.ts',
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
