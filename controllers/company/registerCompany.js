const Company = require('./../../models/Company');
const UsersAndCompanies = require('./../../models/UsersAndCompanies');
const Place = require('./../../models/Place');
const { USER_ROLES } = require('./../../constants');
const sequelize = require('./../../database');
const { writeCookie } = require('./../../helpers/cookie');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	name: yup.string().required('Field is required').nullable(),
	latitude: yup.string().required('Field is required').nullable(),
	longtitude: yup.string().required('Field is required').nullable(),
	address: yup.string().required('Field is required').nullable(),
});

const registerCompany = async (req, res) => {
	const { name, latitude, longtitude, address, logo } = req.body;
	const { user_id } = req.headers;
	const image = req.file;

	const v = await validate(validationSchema, {
		name,
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

	const transaction = await sequelize.transaction();

	let company;

	try {
		company = await Company.create(
			{
				name: name,
				logo: image?.path || null,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		transaction.rollback();
		return res.status(400).json({
			success: false,
		});
	}

	let place;

	const location = { type: 'Point', coordinates: [longtitude, latitude] };

	try {
		place = await Place.create(
			{
				location: location,
				address,
				// latitude,
				// longtitude,
				CompanyId: company.id,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		transaction.rollback();
		return res.status(400).json({
			success: false,
		});
	}

	let relation;

	try {
		relation = await UsersAndCompanies.create(
			{
				role: USER_ROLES.OWNER,
				CompanyId: company.id,
				UserId: user_id,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		transaction.rollback();
		return res.status(400).json({
			success: false,
		});
	}
	transaction.commit();

	writeCookie(res, 'role', USER_ROLES.OWNER);
	writeCookie(res, 'companyId', company.id);

	return res.status(201).json({
		success: true,
		data: {
			company: {
				...company.toJSON(),
			},
			place: {
				...place.toJSON(),
			},
			relation: {
				...relation.toJSON(),
			},
		},
	});
};

module.exports = registerCompany;
