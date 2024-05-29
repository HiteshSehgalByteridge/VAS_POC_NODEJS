
const { DataTypes } = require('sequelize');

const { sequelize } = require('../sequelize');

const Book = sequelize.define('Book',
{
  id:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title:
  {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  author:
  {
    type: DataTypes.STRING,
    allowNull: false
  },
  releaseYear:
  {
    type: DataTypes.NUMBER,
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
  Book
};
