test("get to /api/v1/status should return 200", async () => {
  const response = await fetch(
    "https://laughing-funicular-qr4qppgrpww26w5g-3000.app.github.dev/api/v1/status",
  );
  expect(response.status).toBe(200);
});
