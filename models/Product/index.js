const { PRODUCT_STATUSES } = require('./../../constants');
const Image = require('../Image');
const Place = require('../Place');
const Company = require('../Company');
const OrderProduct = require('./../Order/OrderProduct');

const sequelize = require('./../../database');

const Product = sequelize.define(
	'Product',
	{
		// Model attributes are defined here
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING,
		},
		initialCount: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: 10,
		},
		availableCount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		availableCountPerPerson: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		fullPrice: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		discountPercent: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		priceWithDiscount: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		takeTimeFrom: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		takeTimeTo: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		availableForSale: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: PRODUCT_STATUSES.ACTIVE,
		},
		CompanyId: {
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
			references: {
				model: Company,
				key: 'id',
			},
		},
	},
	{
		sequelize,
	}
);

Product.belongsTo(Place);
Place.hasMany(Product);

Product.belongsTo(Company);

Product.hasMany(Image);

Product.hasMany(OrderProduct);
OrderProduct.belongsTo(Product);

module.exports = Product;
