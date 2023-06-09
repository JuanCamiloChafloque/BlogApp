const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged-in", async () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("can see blog create form", async () => {
    jest.setTimeout(120000);
    const label = await page.getContentsOf("form label");
    expect(label).toBe("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My content");
      await page.click("form button");
    });

    test("Submitting takes user to review screen", async () => {
      jest.setTimeout(120000);
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });

    /*     test("Submitting then saving adds blog to index page", async () => {
      jest.setTimeout(120000);
      await page.click("button.green");
      await page.waitFor(".card");
      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");
      expect(title).toEqual("My Title");
      expect(content).toEqual("My content");
    }); */
  });

  describe("And using invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("the form shows an error message", async () => {
      jest.setTimeout(120000);
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");
      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe("When not logged-in", async () => {
  test("User cannot create blog posts", async () => {
    jest.setTimeout(120000);
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: "My Title", content: "My content" }),
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });

  test("User cannot get a list of posts", async () => {
    jest.setTimeout(120000);
    const result = await page.evaluate(() => {
      return fetch("/api/blogs", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
    });

    expect(result).toEqual({ error: "You must log in!" });
  });
});
