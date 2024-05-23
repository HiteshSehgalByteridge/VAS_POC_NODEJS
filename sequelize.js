
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'vas_db_1', // DB Name
    'root', // Username
    'root', // Password
    {
        host: 'localhost',
        dialect: 'mysql'
    }
);

module.exports =
{
    sequelize
};
