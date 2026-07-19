import database from "infra/database";
import crypto from "node:crypto";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days

function getExpirationDate() {
  return new Date(Date.now() + EXPIRATION_TIME);
}

async function FindOneValidByToken(sessionToken) {
  const sessionFound = await runSelectQuery(sessionToken);

  return sessionFound;

  async function runSelectQuery(sessionToken) {
    const result = await database.query({
      text: `
        SELECT 
          * 
        FROM 
          sessions
        WHERE 
          token = $1 
        AND 
          expires_at > NOW()
        LIMIT 1
        ;`,
      values: [sessionToken],
    });

    if (result.rowCount === 0) {
      throw new UnauthorizedError({
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
      });
    }

    return result.rows[0];
  }
}

async function createSession(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = getExpirationDate();
  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO 
            sessions (token, user_id, expires_at)
        VALUES 
            ($1, $2, $3)
        RETURNING 
            *
        ;`,
      values: [token, userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function renewSession(sessionId) {
  const expiresAt = getExpirationDate();

  const renewedSessionObject = await runUpdateQuery(sessionId, expiresAt);

  return renewedSessionObject;

  async function runUpdateQuery(sessionId, expiresAt) {
    const result = await database.query({
      text: `
        UPDATE 
          sessions
        SET 
          expires_at = $2,
          updated_at = NOW()
        WHERE 
          id = $1
        RETURNING 
          *
        ;`,
      values: [sessionId, expiresAt],
    });

    return result.rows[0];
  }
}

async function expireById(sessionId) {
  const expiredSession = await runUpdateQuery(sessionId);
  return expiredSession;

  async function runUpdateQuery(sessionId) {
    const result = await database.query({
      text: `
        UPDATE 
          sessions
        SET 
          expires_at = expires_at - INTERVAL '1 year',
          updated_at = NOW()
        WHERE 
          id = $1
        RETURNING 
          *
        ;`,
      values: [sessionId],
    });

    return result.rows[0];
  }
}

const session = {
  createSession,
  EXPIRATION_TIME,
  FindOneValidByToken,
  renewSession,
  expireById,
};

export default session;
