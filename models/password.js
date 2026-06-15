import bcryptjs from "bcryptjs";

async function hash(password) {
  let rounds = process.env.NODE_ENV === "production" ? 14 : 1;
  return await bcryptjs.hash(password, rounds);
}

async function compare(plainPassword, hashedPassword) {
  return await bcryptjs.compare(plainPassword, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
