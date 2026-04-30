import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("anonymous user", () => {
    test("Retrieve current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody.update_at).toBeDefined();

      const parsedUpdateAt = new Date(responseBody.update_at).toISOString();
      expect(responseBody.update_at).toEqual(parsedUpdateAt);

      expect(responseBody.version).toEqual(16.0);
      expect(responseBody.max_connections).toEqual(100);
      expect(responseBody.opened_connections).toEqual(1);
    });
  });
});
