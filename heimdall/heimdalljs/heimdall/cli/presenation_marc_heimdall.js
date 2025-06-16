const fs = require("fs");
const { execSync } = require("child_process");

const CHALLENGE = 1234;

try {
  console.log("Generate presentation (using /temp sources)");
  // Debug log: Log the credential attributes used for the Merkle tree
  const credential = JSON.parse(fs.readFileSync("cred_holder.json", "utf8"));
  console.log("Credential attributes:", credential.attributes);
  console.log("Credential attributes length:", credential.attributes.length);

  execSync([
    "heimdalljs pres attribute 9",
    "--expiration 100",
    `--challenge ${CHALLENGE}`,
    "--credential cred_holder.json",
    "--destination employer_pres_attribute.json",
    "--secretKey holder_sk.txt",
    "--issuerPK"
  ].join(" "), { stdio: 'inherit' });

  if (!fs.existsSync("employer_pres_attribute.json")) {
    console.error("employer_pres_attribute.json missing — presentation failed");
    process.exit(1);
  }

  console.log("Verify presentation");
  execSync("heimdalljs verify employer_pres_attribute.json", { stdio: 'inherit' });

  console.log("Done");
} catch (err) {
  console.error("Error:", err.message || err);
  process.exit(1);
}
