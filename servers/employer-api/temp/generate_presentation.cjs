
const fs = require("fs");
const { execSync } = require("child_process");

try {
  console.log("Generate presentation");
  const credential = JSON.parse(fs.readFileSync("employer_cred_holder.json", "utf8"));

  execSync([
    "node /Users/ludwiggrober/WebstormProjects/Rental-ZKPs/heimdall/heimdalljs/cli/heimdalljs-pres-attribute.js 8",
    "--expiration 100",
    "--challenge 1750777113669",
    "--credential /Users/ludwiggrober/WebstormProjects/Rental-ZKPs/servers/employer-api/temp/employer_cred_holder.json",
    "--destination /Users/ludwiggrober/WebstormProjects/Rental-ZKPs/servers/employer-api/temp/employer_pres_attribute.json",
    "--secretKey /Users/ludwiggrober/WebstormProjects/Rental-ZKPs/servers/employer-api/temp/employer_holder_sk.txt",
    "--issuerPK /Users/ludwiggrober/WebstormProjects/Rental-ZKPs/servers/employer-api/temp/employer_issuer_pk.json"
  ].join(" "), { stdio: 'inherit' });

  if (!fs.existsSync("employer_pres_attribute.json")) {
    console.error("Presentation file missing — generation failed");
    process.exit(1);
  }

  console.log("Presentation generated successfully");
} catch (err) {
  console.error("Error:", err.message || err);
  process.exit(1);
}