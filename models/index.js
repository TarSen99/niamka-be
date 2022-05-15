const { DataTypes } = require('sequelize');
const sequelize = require('./../database');

const createcompany = require('./company.js');
const createimage = require('./image.js');
const createorder = require('./order.js');
const createorderproduct = require('./orderproduct.js');
const createplace = require('./place.js');
const createproduct = require('./product.js');
const createprofilesettings = require('./profilesettings.js');
const createpushtoken = require('./pushtoken.js');
const createsavedcreditcard = require('./savedcreditcard.js');
const createtransaction = require('./transaction.js');
const createuser = require('./user.js');
const createusersandcompanies = require('./usersandcompanies.js');
const createrequest = require('./request.js');

const Company = createcompany(sequelize, DataTypes);
const Image = createimage(sequelize, DataTypes);
const Order = createorder(sequelize, DataTypes);
const OrderProduct = createorderproduct(sequelize, DataTypes);
const Place = createplace(sequelize, DataTypes);
const Product = createproduct(sequelize, DataTypes);
const ProfileSettings = createprofilesettings(sequelize, DataTypes);
const PushToken = createpushtoken(sequelize, DataTypes);
const SavedCreditCard = createsavedcreditcard(sequelize, DataTypes);
const Transaction = createtransaction(sequelize, DataTypes);
const User = createuser(sequelize, DataTypes);
const UsersAndCompanies = createusersandcompanies(sequelize, DataTypes);
const Request = createrequest(sequelize, DataTypes);

const models = {
	Company,
	Image,
	Order,
	OrderProduct,
	Place,
	Product,
	ProfileSettings,
	PushToken,
	SavedCreditCard,
	Transaction,
	User,
	UsersAndCompanies,
	Request,
};

Object.keys(models).forEach((k) => models[k].associate(models));

module.exports = {
	Company,
	Image,
	Order,
	OrderProduct,
	Place,
	Product,
	ProfileSettings,
	PushToken,
	SavedCreditCard,
	Transaction,
	User,
	UsersAndCompanies,
	Request,
};
