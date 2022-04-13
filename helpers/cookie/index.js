const expiresIn = 60 * 60 * 24 * 1000 * 1000; // 1000 days
const options = {
	maxAge: expiresIn,
	httpOnly: true, // The cookie only accessible by the web server
	signed: true, // Indicates if the cookie should be signed
};

const writeCookie = (res, key, data) => {
	res.cookie(key, data, options);
};

const clearCookie = (res, key) => {
	res.clearCookie(key, options);
};

module.exports = {
	writeCookie,
	clearCookie,
};
