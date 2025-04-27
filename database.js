const fs = require("fs");

const dbFile = "./chat.db"
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sglite3").verbose();
const dbWrapper = require("sqlite");
let db;

db = dBase;
try{
    if(!exists) {
        await db.run(
            `CREATE TABLE user(
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                login TEXT
            );`
        );
    } else{
    console.log(await db.all("SELECT * from user"));
}

} catch (dbError){
    console.error(dbError);
}