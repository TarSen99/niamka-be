const { DateTime } = require('luxon');
const fs = require('fs');

const isNull = (v) => {
	if (!v) {
		return true;
	}

	return v === 'null' || v === 'undefined' || v === 'NaN';
};

const getProductsPickupDate = (products) => {
	const cp = [...products];

	const sortByLowestTime = cp.sort((a, b) => {
		const timeA = DateTime.fromISO(a.takeTimeTo);
		const timeB = DateTime.fromISO(b.takeTimeTo);

		return timeA.diff(timeB);
	});

	const lowestEl = sortByLowestTime[0];

	return lowestEl.takeTimeTo;
};

const waitTime = (time, preMillis = 0) => {
	const takeTimeToDate = DateTime.fromJSDate(new Date(time));
	const beforeTime = takeTimeToDate.minus({ milliseconds: preMillis });

	const now = DateTime.now();
	const diff = beforeTime.diff(now).toObject();
	const { milliseconds } = diff;

	return milliseconds;
};

const addTimeToNow = (h) => {
	const now = DateTime.now();
	const plus2h = now.plus({ hours: h || 2 });

	return plus2h.toISO();
};

const readEmail = (path, data) => {
	const fields = [];

	for (const key in data) {
		fields.push({ key: `[${key}]`, value: data[key] });
	}

	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf8', function (err, data) {
			if (err) reject(err);

			let newData = data;

			for (const f of fields) {
				newData = newData.replace(f.key, f.value);
			}
			resolve(newData);
		});
	});
};

module.exports = {
	isNull,
	getProductsPickupDate,
	waitTime,
	readEmail,
	addTimeToNow,
};
