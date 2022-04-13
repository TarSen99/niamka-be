const User = require('./../../models/User');
const Company = require('./../../models/Company');
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
});

const updateEmployee = async (req, res) => {
	const { name, role } = req.body;
	const { employeeId } = req.params;

	const v = await validate(validationSchema, {
		employeeId,
		name,
		role,
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
