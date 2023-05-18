/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    reporters: ["summary"],
    coverageReporters: ["text-summary"],
    coverageProvider: "v8",
    collectCoverageFrom: [
        'src/**/*.{ts,js,tsx}',
    ],
};
