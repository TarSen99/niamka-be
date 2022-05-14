const { User, UsersAndCompanies } = require('./../../models');
const {
	USER_ROLES_ARRAY,
	REGISTER_TYPES,
	USER_ROLES,
} = require('./../../constants');
const sequelize = require('./../../database');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const { getAuth } = require('firebase-admin/auth');

const validationSchema = yup.object().shape({
	name: yup.string().required('Field is required').nullable(),
	role: yup
		.string()
		.required('Field is required')
		.oneOf(USER_ROLES_ARRAY, 'Role is not valid')
		.nullable(),
	email: yup
		.string()
		.required('Field is required')
		.email('Email is not valid')
		.nullable(),
	password: yup
		.string()
		.required('Field is required')
		.min(8, 'Password must contain at least 8 characters'),
	place: yup.string().when('role', (role, schema) => {
		if (role === USER_ROLES.OWNER || role === USER_ROLES.MANAGER) {
			return schema;
		}

		return schema.required('Field is required');
	}),
});

const addEmployee = async (req, res) => {
	const { companyId } = req.headers;
	const { name, email, password, role, place } = req.body;

	const v = await validate(validationSchema, {
		name,
		email,
		password,
		role,
		place,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	const transaction = await sequelize.transaction();

	let employee;

	try {
		[row, created] = await User.findOrCreate({
			where: {
				email,
			},
			defaults: {
				name,
				email,
				registerType: 'email',
			},
			transaction,
		});

		employee = row;

		if (created) {
			await getAuth().createUser({
				email,
				password,
				displayName: REGISTER_TYPES.EMAIL,
			});
		}
	} catch (e) {
		console.log(e);
		await transaction.rollback();
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'error',
					error: e,
				},
			],
		});
	}

	const all = await UsersAndCompanies.findAll({
		where: {
			UserId: employee.id,
		},
	});

	if (all.length) {
		await transaction.rollback();

		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'email',
					error: 'Email is already used.',
				},
			],
		});
	}

	let relation;

	try {
		relation = await UsersAndCompanies.create(
			{
				UserId: employee.id,
				CompanyId: companyId,
				role: role,
				placeId: place,
			},
			{
				transaction,
			}
		);
	} catch (e) {
		await transaction.rollback();

		console.log(e);

		return res.status(500).json({
			success: false,
			errors: [
				{
					field: 'error',
					message: e,
				},
			],
		});
	}

	await transaction.commit();

	return res.status(201).json({
		success: true,
		data: {
			user: {
				...employee.toJSON(),
			},
			relation: {
				...relation.toJSON(),
			},
		},
	});
};

module.exports = addEmployee;
