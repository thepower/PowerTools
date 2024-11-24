/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportOnFailure: true,
      all: true,
      reporter: ['text', 'json', 'json-summary']
    }
  }
})
