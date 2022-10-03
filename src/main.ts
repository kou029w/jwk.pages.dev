import "@exampledev/new.css";
import { exportJWK, generateKeyPair } from "jose";

const form = document.querySelector("form") as HTMLFormElement;
const output = document.querySelector("#output") as HTMLPreElement;

async function onSubmit(e: SubmitEvent) {
  e.preventDefault();
  const alg = new FormData(form).get("alg") as string;
  const { privateKey } = await generateKeyPair(alg, { extractable: true });
  const jwk = await exportJWK(privateKey);
  output.textContent = JSON.stringify(jwk, null, "  ");
}

form?.addEventListener("submit", onSubmit);
