import { customAlphabet } from "nanoid";

const alphabet = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const makeShortId = customAlphabet(alphabet, 8);

export function shortId() {
  return makeShortId();
}

const tokenAlphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const makeOwnerToken = customAlphabet(tokenAlphabet, 32);

export function ownerToken() {
  return makeOwnerToken();
}
