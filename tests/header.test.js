const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("Header logo has correct text", async () => {
  test.setTimeout(120000);
  const text = await page.getContentsOf("a.brand-logo");
  expect(text).toEqual("Blogster");
});

test("Clicking login start oAuth flow", async () => {
  test.setTimeout(120000);
  await page.click(".right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed-in, shows logout button", async () => {
  test.setTimeout(120000);
  await page.login();
  const text = await page.getContentsOf("a[href='/auth/logout']");
  expect(text).toEqual("Logout");
});
