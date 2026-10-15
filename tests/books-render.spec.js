const { test, expect } = require("@playwright/test");
const Books = require("../assets/js/books-catalogue");
const Render = require("../assets/js/guide-render");

for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
  test(`Books catalogue at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    // The local static server does not implement Netlify Image CDN. Optional
    // test-only fixture is the unchanged production first cover, never deployed.
    if (process.env.MPC_FIRST_COVER_FIXTURE) {
      await page.route("**/.netlify/images?**", route => route.fulfill({
        path: process.env.MPC_FIRST_COVER_FIXTURE, contentType: "image/webp"
      }));
    }
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/books.html");
    const cards = page.locator("#bookGrid .book-card");
    await expect(cards).toHaveCount(4);
    await expect(cards.locator("h2")).toHaveText(Books.DEFAULTS.map(book => book.title));
    await expect(cards.locator(".status")).toHaveText(Books.DEFAULTS.map(book => book.status));
    for (let i=0; i<4; i++) {
      await expect(cards.nth(i).locator(".book-summary")).toHaveText(Books.DEFAULTS[i].summary);
      const image=cards.nth(i).locator("img");
      await expect(image).toHaveAttribute("src", Render.img(Books.DEFAULTS[i].cover,600));
      await image.scrollIntoViewIfNeeded();
      if (i>0 || process.env.MPC_FIRST_COVER_FIXTURE || !page.url().includes("localhost")) {
        await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth>0)).toBe(true);
      }
      const box=await image.boundingBox();
      expect(box.width).toBeGreaterThan(100);
      expect(Math.abs(box.height/box.width-1.5)).toBeLessThan(0.02);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const positions = await cards.evaluateAll(items => items.map(item => { const r=item.getBoundingClientRect(); return {x:r.x,y:r.y}; }));
    if (viewport.width===1440) expect(new Set(positions.map(p=>Math.round(p.y))).size).toBe(1);
    if (viewport.width<=390) expect(new Set(positions.map(p=>Math.round(p.x))).size).toBe(1);
    expect(errors).toEqual([]);
    await page.screenshot({ path:`test-results/books-${viewport.width}.png`, fullPage:true });
  });
}
