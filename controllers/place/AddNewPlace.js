const Place = require('./../../models/Place');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	latitude: yup.string().required('Field is required').nullable(),
	longtitude: yup.string().required('Field is required').nullable(),
	address: yup.string().required('Field is required').nullable(),
});

const registerCompany = async (req, res) => {
	const { latitude, longtitude, address } = req.body;
	const { company_id } = req.headers;

	const v = await validate(validationSchema, {
		latitude,
		longtitude,
		address,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let place;

	const location = { type: 'Point', coordinates: [longtitude, latitude] };

	try {
		place = await Place.create({
			location: location,
			address,
			// latitude,
			// longtitude,
			CompanyId: company_id,
		});
	} catch (e) {
		console.log(e);
		return res.status(400).json({
			success: false,
		});
	}

	return res.status(201).json({
		success: true,
		data: { ...place.toJSON() },
	});
};

module.exports = registerCompany;
