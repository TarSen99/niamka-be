const { Company, UsersAndCompanies, Place, User } = require('./../../models');
const {
	USER_ROLES,
	ESTABLISHMENT_TYPES,
	ESTABLISHMENT_TYPES_AS_ARRAY,
} = require('./../../constants');
const sequelize = require('./../../database');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const emailService = require('./../../services/email-service');
const { readEmail } = require('./../../helpers');

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
	const {
		name,
		latitude,
		longtitude,
		address,
		type,
		description,
		city,
		user_email,
		user_password,
	} = req.body;
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

	let userData;

	try {
		userData = await User.findOne({
			where: {
				email: user_email,
			},
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
			email: 'User not found',
		});
	}

	if (!userData) {
		return res.status(400).json({
			success: false,
			email: 'User not found',
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
				UserId: userData.id,
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

	const emailData = await readEmail(
		'public/emails/Niamka_company_created.html',
		{
			user_name: userData.name,
			user_login: user_email,
			user_password: user_password,
			company_name: company.name,
		}
	);

	await emailService.send({
		html: emailData,
		email: user_email,
		subject: 'Вітаємо в команді!',
	});

	// writeCookie(res, 'role', USER_ROLES.OWNER);
	// writeCookie(res, 'companyId', company.id);

	// const secretData = {
	// 	userId: id,
	// 	companyId: company.id,
	// 	role: relation.role,
	// };

	// const encrypted = encrypt(JSON.stringify(secretData));

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
