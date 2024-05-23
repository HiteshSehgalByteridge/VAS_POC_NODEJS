
const { DataTypes } = require('sequelize');

const { sequelize } = require('../sequelize');

const ChangeLog = sequelize.define('ChangeLog',
{
  id:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId:
  {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action:
  {
    type: DataTypes.STRING,
    allowNull: false
  },
  data:
  {
    type: DataTypes.STRING,
    allowNull: false
  },
  tableName:
  {
    type: DataTypes.STRING,
    allowNull: false 
  },
  isSynced:
  {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  updatedFields:
  {
    type: DataTypes.STRING,
    allowNull: true
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
});

module.exports =
{
    ChangeLog
};
