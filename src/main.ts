import "@exampledev/new.css";
import {
  calculateJwkThumbprint,
  calculateJwkThumbprintUri,
  exportJWK,
  generateKeyPair,
} from "jose";

const form = document.querySelector("form") as HTMLFormElement;
const publicKeyOutput = document.querySelector("#public") as HTMLPreElement;
const privateKeyOutput = document.querySelector("#private") as HTMLPreElement;

async function onSubmit(e: SubmitEvent) {
  e.preventDefault();
  const data = new FormData(form);
  const alg = data.get("alg") as string;
  const use = {
    ES256: "sig",
    ES384: "sig",
    ES512: "sig",
    RS256: "sig",
    RS384: "sig",
    RS512: "sig",
    PS256: "sig",
    PS384: "sig",
    PS512: "sig",
    "ECDH-ES": "enc",
    "ECDH-ES+A128KW": "enc",
    "ECDH-ES+A192KW": "enc",
    "ECDH-ES+A256KW": "enc",
    "RSA-OAEP": "enc",
    "RSA-OAEP-256": "enc",
    "RSA-OAEP-384": "enc",
    "RSA-OAEP-512": "enc",
  }[alg];
  const { privateKey, publicKey } = await generateKeyPair(alg, {
    extractable: true,
  });
  const jwk = await exportJWK(privateKey);
  const createKid = {
    "rfc7638-s256": () => calculateJwkThumbprint(jwk, "sha256"),
    "rfc7638-s384": () => calculateJwkThumbprint(jwk, "sha384"),
    "rfc7638-s512": () => calculateJwkThumbprint(jwk, "sha512"),
    "rfc9278-s256": () => calculateJwkThumbprintUri(jwk, "sha256"),
    "rfc9278-s384": () => calculateJwkThumbprintUri(jwk, "sha384"),
    "rfc9278-s512": () => calculateJwkThumbprintUri(jwk, "sha512"),
    uuid: () => crypto.randomUUID(),
    "uuid-uri": () => `urn:uuid:${crypto.randomUUID()}`,
    "unix-timestamp": () => String(Math.floor(new Date().getTime() / 1_000)),
    "ecma-timestamp": () => String(new Date().getTime()),
    "date-time": () => new Date().toISOString(),
  }[data.get("kid-method") as string];
  const kid = await createKid?.();
  privateKeyOutput.textContent = JSON.stringify(
    { alg, use, kid, ...jwk },
    null,
    "  ",
  );
  publicKeyOutput.textContent = JSON.stringify(
    { alg, use, kid, ...(await exportJWK(publicKey)) },
    null,
    "  ",
  );
}

form?.addEventListener("submit", onSubmit);
