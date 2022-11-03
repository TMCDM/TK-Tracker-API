const boxAndQuoteDBConfig = {
	server: process.env.SERVER,
	port: 1433,
	database: process.env.DATABASE,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	options: {
		// instanceName: 'PDMWORKS',
		trustServerCertificate: true,
		enableArithAbort: true,
		encrypt: false,
	}
}



module.exports = { boxAndQuoteDBConfig }