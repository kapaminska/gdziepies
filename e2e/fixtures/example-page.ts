import { Page, Locator } from '@playwright/test';

/**
 * Example Page Object Model class
 * 
 * This demonstrates the Page Object Model pattern recommended for E2E tests.
 * Create similar classes for each page/section of your application.
 */
export class ExamplePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}



