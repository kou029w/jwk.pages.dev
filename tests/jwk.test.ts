import { test, expect } from "@playwright/test";

// prettier-ignore
const properties = {
  "ECDSA (ES256)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDSA (ES384)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "ECDSA (ES512)":              ["alg", "use", "kid", "kty", "crv", "x", "y", "d"],
  "EdDSA":                      ["alg", "use", "kid", "kty", "crv", "x", "d"],
  "Ed25519":                    ["alg", "use", "kid", "kty", "crv", "x", "d"],
  "ML-DSA-44":                  ["alg", "use", "kid", "kty", "pub", "priv"],
  "ML-DSA-65":                  ["alg", "use", "kid", "kty", "pub", "priv"],
  "ML-DSA-87":                  ["alg", "use", "kid", "kty", "pub", "priv"],
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

const MLDSA = ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"];

// プラットフォーム、ブラウザーごとの非対応アルゴリズム
// prettier-ignore
const unsupported: Record<string, Record<string, string[]>> = {
  linux:  { firefox: MLDSA, webkit: MLDSA },
  darwin: { firefox: MLDSA, webkit: MLDSA },
  win32:  { firefox: MLDSA, webkit: [...MLDSA, "EdDSA", "Ed25519"] },
};
// prettier-ignore-end

// サポート有無の判定に使う Web Crypto API のアルゴリズム
const webCryptoAlgorithm: Record<string, string> = {
  EdDSA: "Ed25519",
  Ed25519: "Ed25519",
  "ML-DSA-44": "ML-DSA-44",
  "ML-DSA-65": "ML-DSA-65",
  "ML-DSA-87": "ML-DSA-87",
};

for (const [algorithm, expected] of Object.entries(properties)) {
  test(`${algorithm} has ${expected}`, async ({ page, browserName }) => {
    await page.goto("/");

    const name = webCryptoAlgorithm[algorithm];
    if (name) {
      const supported = await page.evaluate(
        (name) =>
          crypto.subtle.generateKey({ name }, true, ["sign", "verify"]).then(
            () => true,
            () => false,
          ),
        name,
      );
      const expectedSupported =
        !unsupported[process.platform]?.[browserName]?.includes(algorithm);
      expect(
        supported,
        `${algorithm} support on ${process.platform}/${browserName}`,
      ).toBe(expectedSupported);
      test.skip(!supported, `${algorithm} is not supported`);
    }

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
