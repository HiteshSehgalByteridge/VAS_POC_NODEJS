
const { DataTypes } = require('sequelize');

const { sequelize } = require('../sequelize');

const User = sequelize.define('User',
{
  id:
  {
    type: DataTypes.STRING,
    primaryKey: true
  },
  username:
  {
    type: DataTypes.STRING,
    allowNull: false
  },
  email:
  {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age:
  {
    type: DataTypes.NUMBER,
    allowNull: false
  },
  city:
  {
    type: DataTypes.STRING,
    allowNull: false
  },
  isActive:
  {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  createdAt:
  {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt:
  {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
},
{
  timestamps: true,
  updatedAt: false
}
);

module.exports =
{
  User
};
