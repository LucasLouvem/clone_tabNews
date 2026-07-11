import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.authenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.createSession(authenticatedUser.id);

  const setCookie = cookie.serialize("sessionId", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_TIME / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);

  response.status(201).json(newSession);
}
