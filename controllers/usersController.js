
const { action, table_name } = require('../enum');
const { ChangeLog } = require('../models/changeLog');
const { User } = require('../models/user');

getUsers = async (req, res) =>
{
    try
    {
        const userData = await User.findAll();

        res.status(200).send(
            {
                success: true,
                message: 'getUsers method is called',
                data: userData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getUsers method is called',
                error: error.toString()
            }
        );
    }
};

createUser = async (req, res) =>
{
    try
    {
        const { username, email, age, city } = req.body;

        const userData = await User.create(
            {
                username: username,
                email: email,
                age: age,
                city: city,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        // console.log('userData', userData);

        const changeLogData = await ChangeLog.create({
            userId: userData.id,
            action: action.INSERT,
            tableName: table_name.USERS,
            isSynced: false,
            data: JSON.stringify(userData),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // console.log('changeLogData', changeLogData);

        res.status(200).send(
            {
                success: true,
                message: 'createUser method is called',
                data: userData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'createUser method is called',
                error: error.toString()
            }
        );
    }
};

updateUser = async (req, res) =>
{
    try
    {
        const { id, username, age, city } = req.body;

        const user = await User.findByPk(id);
       
        // console.log('user', user);

        if (!user)
        {
            return res.status(404).send(
                {
                    success: false,
                    message: 'User not found'
                }
            );
        }

        // Collect updated fields
        
        const updatedFields = [];
        
        if (username != undefined && user.username !== username)
        {
            updatedFields.push('username');
            user.username = username;
        }

        if (age != undefined && user.age !== age)
        {
            updatedFields.push('age');
            user.age = age;
        }

        if (city != undefined && user.city !== city)
        {
            updatedFields.push('city');
            user.city = city;
        }

        // user.username = username;
        user.isActive = true;
        user.updatedAt = new Date();
        
        const userData = await user.save();

        // console.log('userData', userData);

        const changeLogData = await ChangeLog.create({
            userId: userData.id,
            action: action.UPDATE,
            tableName: table_name.USERS,
            updatedFields: updatedFields.join(','),
            isSynced: false,
            data: JSON.stringify(userData),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // console.log('changeLogData', changeLogData);

        res.status(200).send({
            success: true,
            message: 'User updated successfully',
            data: userData
        });
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'updateUser method is called',
                error: error.toString()
            }
        );
    }
};

deleteUser = async (req, res) =>
{
    try
    {
        const { id } = req.params;

        // console.log('id', id);

        const user = await User.findByPk(id);
       
        // console.log('user', user);

        if (!user)
        {
            return res.status(404).send(
                {
                    success: false,
                    message: 'User not found'
                }
            );
        }

        user.isActive = false;
        user.updatedAt = new Date();
        
        const userData = await user.save();

        // console.log('userData', userData);

        const changeLogData = await ChangeLog.create({
            userId: userData.id,
            action: action.DELETE,
            tableName: table_name.USERS,
            isSynced: false,
            data: JSON.stringify(userData),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        // console.log('changeLogData', changeLogData);

        res.status(200).send(
            {
                success: true,
                message: 'User deleted successfully',
                data: userData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'deleteUser method is called',
                error: error.toString()
            }
        );
    }
};

module.exports =
{
    getUsers,
    createUser,
    updateUser,
    deleteUser
};