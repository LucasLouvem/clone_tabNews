import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid sessions", async () => {
      const createUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObject = await orchestrator.createSession(createUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheResponse = response.headers.get("Cache-Control");
      expect(cacheResponse).toBe("no-store, no-cache, must-revalidate");

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createUser.id,
        username: "UserWithValidSession",
        email: createUser.email,
        password: createUser.password,
        created_at: createUser.created_at.toISOString(),
        updated_at: createUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session Renewal assertions
      const renewedSessionObject = await session.FindOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie Assertion

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      console.log("parsedSetCookie:", parsedSetCookie);

      expect(parsedSetCookie.sessionId).toEqual({
        name: "sessionId",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_TIME / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With valid sessions after 15 days", async () => {
      const createUser = await orchestrator.createUser({
        username: "UserWithValidSession15days",
      });

      jest.useFakeTimers({
        now: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days in the past
      });

      const sessionObject = await orchestrator.createSession(createUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createUser.id,
        username: "UserWithValidSession15days",
        email: createUser.email,
        password: createUser.password,
        created_at: createUser.created_at.toISOString(),
        updated_at: createUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      // Session Renewal assertions
      const renewedSessionObject = await session.FindOneValidByToken(
        sessionObject.token,
      );

      expect(
        renewedSessionObject.expires_at > sessionObject.expires_at,
      ).toEqual(true);
      expect(
        renewedSessionObject.updated_at > sessionObject.updated_at,
      ).toEqual(true);

      // Set-Cookie Assertion

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      console.log("parsedSetCookie:", parsedSetCookie);

      expect(parsedSetCookie.sessionId).toEqual({
        name: "sessionId",
        value: renewedSessionObject.token,
        maxAge: session.EXPIRATION_TIME / 1000,
        path: "/",
        httpOnly: true,
      });
    });

    test("With nonexistent sessions", async () => {
      const noneistentToken =
        "6bc7a972d55e3b90fac061d2d2461421ced70d42fe69e2542ff12d062cbee1d5a6c5f862088c427058f43cdeb4de3759";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${noneistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired sessions", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_TIME), // 31 days in the past
      });

      const createUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
