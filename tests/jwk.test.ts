import { test, expect } from "@playwright/test";

// prettier-ignore
const properties = {
  "ECDSA (ES256)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDSA (ES384)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDSA (ES512)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "RSASSA-PKCS1-v1_5 (RS256)":  ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSASSA-PKCS1-v1_5 (RS384)":  ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSASSA-PKCS1-v1_5 (RS512)":  ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSASSA-PSS (PS256)":         ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSASSA-PSS (PS384)":         ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSASSA-PSS (PS512)":         ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "ECDH-ES":                    ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDH-ES+A128KW":             ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDH-ES+A192KW":             ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDH-ES+A256KW":             ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "RSA-OAEP":                   ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSA-OAEP-256":               ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSA-OAEP-384":               ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
  "RSA-OAEP-512":               ["alg", "use", "kid", "kty", "e", "n", "d", "p", "q", "dp", "dq", "qi"],
};
// prettier-ignore-end

for (const [algorithm, expected] of Object.entries(properties)) {
  test(`${algorithm} has ${expected}`, async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Algorithm").selectOption({ label: algorithm });
    await page.getByLabel("Generate").click();

    const jwk = await page
      .getByLabel("Private Key")
      .getByText(/./)
      .inputValue()
      .then(JSON.parse);

    for (const property of expected) {
      expect(jwk).toHaveProperty(property, expect.stringMatching(/./));
    }

    expect(Object.keys(jwk)).toHaveLength(expected.length);
  });
}
