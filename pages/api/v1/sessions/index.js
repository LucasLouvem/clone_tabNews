import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.authenticateUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.createSession(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, response);

  response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.FindOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);

  controller.deleteSessionCookie(response);

  return response.status(200).json(expiredSession);
}
