import "@fogtype/css";
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
    EdDSA: "sig",
    Ed25519: "sig",
    "ML-DSA-44": "sig",
    "ML-DSA-65": "sig",
    "ML-DSA-87": "sig",
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

// ブラウザーによって対応していないアルゴリズムの Web Crypto API での名前
const webCryptoAlgorithm: Record<string, string> = {
  EdDSA: "Ed25519",
  Ed25519: "Ed25519",
  "ML-DSA-44": "ML-DSA-44",
  "ML-DSA-65": "ML-DSA-65",
  "ML-DSA-87": "ML-DSA-87",
};

async function disableUnsupportedAlgorithms() {
  const select = form.elements.namedItem("alg") as HTMLSelectElement;
  select.setAttribute("aria-busy", "true");
  await Promise.all(
    Array.from(select.options).map(async (option) => {
      const name = webCryptoAlgorithm[option.value];
      if (!name) return;
      const supported = await crypto.subtle
        .generateKey({ name }, false, ["sign", "verify"])
        .then(
          () => true,
          () => false,
        );
      if (supported) return;
      option.disabled = true;
      option.textContent += " (unsupported)";
    }),
  );
  select.setAttribute("aria-busy", "false");
}

form?.addEventListener("submit", onSubmit);
disableUnsupportedAlgorithms();
