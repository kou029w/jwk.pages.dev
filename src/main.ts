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
  const use = (data.get("use") as string) || undefined;
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
    "date-time": () => new Date().toISOString(),
  }[data.get("kid-method") as string];
  const kid = await createKid?.();
  privateKeyOutput.textContent = JSON.stringify(
    { ...{ alg, use, kid }, ...jwk },
    null,
    "  "
  );
  publicKeyOutput.textContent = JSON.stringify(
    {
      ...{ alg, use, kid },
      ...(await exportJWK(publicKey)),
    },
    null,
    "  "
  );
}

form?.addEventListener("submit", onSubmit);
