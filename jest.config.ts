import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testEnvironment: 'node',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: 'coverage',

    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
        prefix: '<rootDir>/',
    }),
};

export default config;
