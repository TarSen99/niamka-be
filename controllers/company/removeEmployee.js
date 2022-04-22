const { User, UsersAndCompanies } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const checkIfUserExistsInFirebase = require('./../../helpers/firebase/getUser.js');
const app = require('./../../services/firebase');
const { getAuth } = require('firebase-admin/auth');

const validationSchema = yup.object().shape({
	id: yup.string().required('Field is required').nullable(),
});

const removeEmployee = async (req, res) => {
	const { employeeId } = req.params;

	const v = await validate(validationSchema, {
		id: employeeId,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let employee;
	try {
		employee = await User.findByPk(employeeId);
	} catch (e) {
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

	let relations;

	try {
		relations = await UsersAndCompanies.findAll({
			where: {
				UserId: employee.id,
			},
		});
	} catch (e) {
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

	try {
		for (const relation of relations) {
			if (relation.role === 'owner') {
				return res.status(400).json({
					success: false,
					errors: [
						{
							field: 'employeeId',
							error: 'Employee can not be deleted',
						},
					],
				});
			}

			await relation.destroy();
		}
	} catch (e) {
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

	try {
		const auth = getAuth(app);

		const fbUserId = await checkIfUserExistsInFirebase({
			email: employee.email,
		});

		await auth.deleteUser(fbUserId);

		await employee.destroy();
	} catch (e) {
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

	return res.status(200).json({
		success: true,
	});
};

module.exports = removeEmployee;
