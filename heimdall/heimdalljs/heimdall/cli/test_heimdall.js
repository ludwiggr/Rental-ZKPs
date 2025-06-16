const fs = require("fs");
const { execSync } = require("child_process");

const CHALLENGE = 1234;

try {
  console.log("Generate keys");
  execSync("heimdalljs key new issuer > issuer_sk.txt", { stdio: 'inherit' });
  execSync("heimdalljs key pub < issuer_sk.txt > issuer_pk.json", { stdio: 'inherit' });
  execSync("heimdalljs key new holder > holder_sk.txt", { stdio: 'inherit' });
  execSync("heimdalljs key pub < holder_sk.txt > holder_pk.json", { stdio: 'inherit' });

  console.log("Write attributes");
  const attrs = [
    "Renter", "John", "Jones", "No Debt",
    "Rich"
  ];
  fs.writeFileSync("attr_issuer.json", JSON.stringify(attrs, null, 2));

  console.log("Create credential");
  execSync([
    "heimdalljs cred new",
    "--attributes attr_issuer.json",
    "--id 1234501",
    "--publicKey holder_pk.json",
    "--expiration 365",
    "--type IdentityCard",
    "--delegatable 0",
    "--registry https://gitlab.fit.fraunhofer.de/matthias.babel/heimdall-revocation/-/raw/master/",
    "--secretKey issuer_sk.txt",
    "--destination cred_holder.json"
  ].join(" "), { stdio: 'inherit' });

  console.log("Generate presentation");
  execSync([
    "heimdalljs pres attribute 9",
    "--expiration 100",
    `--challenge ${CHALLENGE}`,
    "--credential cred_holder.json",
    "--destination employer_pres_attribute.json",
    "--secretKey holder_sk.txt",
    "--issuerPK"
  ].join(" "), { stdio: 'inherit' });

  if (!fs.existsSync("pres_attribute.json")) {
    console.error("pres_attribute.json missing — presentation failed");
    process.exit(1);
  }

  console.log("Verify presentation");
  execSync("heimdalljs verify pres_attribute.json", { stdio: 'inherit' });

  console.log("Done");
} catch (err) {
  console.error("Error:", err.message || err);
  process.exit(1);
}
