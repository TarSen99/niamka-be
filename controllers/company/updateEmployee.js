const { User, Company } = require('./../../models');
const { USER_ROLES_ARRAY, USER_ROLES } = require('./../../constants');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	name: yup.string().required('Field is required').nullable(),
	role: yup
		.string()
		.required('Field is required')
		.oneOf(USER_ROLES_ARRAY, 'Role is not valid')
		.nullable(),
	employeeId: yup.string().required('Field is required').nullable(),
	place: yup.string().when('role', (role, schema) => {
		if (role === USER_ROLES.OWNER || role === USER_ROLES.MANAGER) {
			return schema;
		}

		return schema.required('Field is required');
	}),
});

const updateEmployee = async (req, res) => {
	const { name, role, place } = req.body;
	const { employeeId } = req.params;

	const v = await validate(validationSchema, {
		employeeId,
		name,
		role,
		place,
	});

	if (role === USER_ROLES.OWNER) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'role',
					error: 'Role is not valid',
				},
			],
		});
	}

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	const employee = await User.findByPk(employeeId, {
		include: Company,
	});

	const roleItem = employee?.Companies[0]?.UsersAndCompanies;

	if (roleItem.role === USER_ROLES.OWNER) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'role',
					error: 'Role is not valid',
				},
			],
		});
	}

	roleItem.role = role;
	employee.name = name;
	roleItem.placeId = place;

	try {
		await employee.save();
		await roleItem.save();
	} catch (e) {
		return res.status(500).json({
			success: false,
			errors: [
				{
					error: e,
					field: 'error',
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: { ...employee.toJSON() },
	});
};

module.exports = updateEmployee;
