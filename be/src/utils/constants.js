const serverHostPort = process.env.HOST_PORT 
const serverHostUrl = process.env.HOST_NAME 
const databaseUrl = process.env.DB_URI 
const temporaryDatabaseUrl = process.env.TEMP_DB_URI 
const frontendUrl = process.env.FE_HOST_URL

// config send email
const emailApp = process.env.EMAIL_APP 
const passwordApp = process.env.PASS_APP 

module.exports = {
    serverHostPort,
    serverHostUrl,
    databaseUrl,
    temporaryDatabaseUrl,
    frontendUrl,
    emailApp,
    passwordApp,
}