db = db.getSiblingDB('db'); // Switch to or create "testdb"

db.createUser({
    user: 'testuser',
    pwd: 'testpass',
    roles: [{role: 'readWrite', db: 'testdb'}],
});


console.log("MongoDB created");
db.listings.insertMany([
    {
        name: "Schönes Apartment",
        address: "Acidstraße 10",
        size: "100sqm",
    }
]);
