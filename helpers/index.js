const { DateTime } = require('luxon');

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

module.exports = {
	isNull,
	getProductsPickupDate,
	waitTime,
};
