const { Company, UsersAndCompanies, Place } = require('./../../models');
const {
	USER_ROLES,
	ESTABLISHMENT_TYPES,
	ESTABLISHMENT_TYPES_AS_ARRAY,
} = require('./../../constants');
const sequelize = require('./../../database');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const { encrypt } = require('./../../helpers/encrypt');

const validationSchema = yup.object().shape({
	name: yup
		.string()
		.required('Field is required')
		.max(50, 'Max length is 50 characters')
		.nullable(),
	description: yup.string().max(250, 'Max length is 250 characters').nullable(),
	latitude: yup.string().required('Field is required').nullable(),
	longtitude: yup.string().required('Field is required').nullable(),
	address: yup.string().required('Field is required').nullable(),
	type: yup
		.string()
		.required('Field is required')
		.oneOf(ESTABLISHMENT_TYPES_AS_ARRAY, 'Type is not valid'),
});

const registerCompany = async (req, res) => {
	const { name, latitude, longtitude, address, type, description, city } =
		req.body;
	const { id } = req.headers;
	const image = req.file;

	const v = await validate(validationSchema, {
		name,
		latitude,
		longtitude,
		address,
		type,
		description,
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
				type,
				description,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		await transaction.rollback();
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
				city,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		await transaction.rollback();
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
				UserId: id,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		console.log(e);
		await transaction.rollback();
		return res.status(400).json({
			success: false,
		});
	}
	await transaction.commit();

	// writeCookie(res, 'role', USER_ROLES.OWNER);
	// writeCookie(res, 'companyId', company.id);

	const secretData = {
		userId: id,
		companyId: company.id,
		role: relation.role,
	};

	const encrypted = encrypt(JSON.stringify(secretData));

	return res.status(201).json({
		success: true,
		encrypted,
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
