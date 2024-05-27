
const { action, table_name } = require('../enum');
const { ChangeLog } = require('../models/changeLog');
const { User } = require('../models/user');

const { Op, where } = require('sequelize');

getChangeLogs = async (req, res) =>
{
    try
    {
        const { timeStamp } = req.body;

        const changeLogData = await ChangeLog.findAll(
            {
                where:
                {
                    updatedAt:
                    {
                        [Op.gte]: new Date(timeStamp)
                    },
                    isSynced: false
                }
            }
        );

        console.log('changeLogData', changeLogData);

        let changeLogDataIDs = [];

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            changeLogData[i].data = JSON.parse(changeLogData[i].data);

            changeLogDataIDs.push(changeLogData[i].id);
        }

        console.log('changeLogDataIDs', changeLogDataIDs);

        const updateChangeLogs = await ChangeLog.update(
            {
                isSynced: true
            },
            {
                where:
                {
                    id: changeLogDataIDs
                }
            }
        );

        console.log('updateChangeLogs', updateChangeLogs);

        let emailMap = {};

        changeLogData.forEach(obj =>
        {
            const email = obj.data.email;
            
            if (emailMap.hasOwnProperty(email))
            {
                const existingObject = emailMap[email];

                const currentUpdatedAt = new Date(obj.data.updatedAt);

                const existingUpdatedAt = new Date(existingObject.data.updatedAt);
            
                if (currentUpdatedAt > existingUpdatedAt)
                {
                    emailMap[email] = obj;
                }
            }
            else
            {
                emailMap[email] = obj;
            }
        });

        // console.log('emailMap', emailMap);

        let filteredArray = Object.values(emailMap);

        filteredArray = filteredArray.map(instance => instance.toJSON());

        // console.log('filteredArray', filteredArray);

        res.status(200).send(
            {
                success: true,
                message: 'getChangeLogs method is called',
                // data: changeLogData
                data: filteredArray
            }
        );
    }
    catch(error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getChangeLogs method is called',
                error: error.toString()
            }
        );
    }
};

getChangeLogsV2 = async (req, res) =>
{
    try
    {
        const { timeStamp } = req.body;

        // Fetching records from ChangeLog table which are not synced yet
        // and have updatedAt value greater than input timestamp value

        let changeLogData = await ChangeLog.findAll(
            {
                where:
                {
                    updatedAt:
                    {
                        [Op.gte]: new Date(timeStamp)
                    },
                    isSynced: false
                }
            }
        );

        changeLogData = changeLogData.map(record => record.toJSON());

        // console.log('changeLogData', changeLogData);

        // Converting data object coming from ChangeLog table records from String to Object
        // And fetching IDs of ChangeLog table records in an array

        let changeLogDataIDs = [];

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            changeLogData[i].data = JSON.parse(changeLogData[i].data);

            changeLogDataIDs.push(changeLogData[i].id);
        }

        // console.log('changeLogDataIDs', changeLogDataIDs);

        // Updating fetched ChangeLogs table records to mark them as synced

        const updateChangeLogs = await ChangeLog.update(
            {
                isSynced: true
            },
            {
                where:
                {
                    id: changeLogDataIDs
                }
            }
        );

        // console.log('updateChangeLogs', updateChangeLogs);

        // Filtering out fetched ChangeLog table records to remove records
        // with multiple actions on the same user

        let emailMap = {};

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            const currentObject = changeLogData[i];

            // console.log('currentObject', currentObject);
            
            const email = currentObject.data.email;

            if (emailMap.hasOwnProperty(email))
            {
                const existingObject = emailMap[email];

                // console.log('existingObject', existingObject);
                
                const currentUpdatedAt = new Date(currentObject.data.updatedAt);
                const existingUpdatedAt = new Date(existingObject.data.updatedAt);

                // New code starts here
                
                const currentAction = currentObject.action;
                const existingAction = existingObject.action;

                let temporaryDataObject = {};
                let temporaryChangeLogObject = {};
                let temporaryUpdatedFieldsArray = [];
                let temporaryUpdatedFieldsString = '';

                let userId = existingObject.data.id;

                if(currentAction == action.UPDATE && existingAction == action.UPDATE)
                {
                    let currentUpdatedFields = currentObject.updatedFields;
                    let existingUpdatedFields = existingObject.updatedFields;

                    let currentUpdatedFieldsArray = currentUpdatedFields.split(',');
                    let existingUpdatedFieldsArray = existingUpdatedFields.split(',');

                    temporaryUpdatedFieldsArray = currentUpdatedFieldsArray.concat(existingUpdatedFieldsArray.filter(item => !currentUpdatedFieldsArray.includes(item)));
                    temporaryUpdatedFieldsString = temporaryUpdatedFieldsArray.join(',');

                    if(currentUpdatedAt > existingUpdatedAt)
                    {
                        temporaryChangeLogObject = JSON.parse(JSON.stringify(currentObject));   
                    }
                    else
                    {
                        temporaryChangeLogObject = JSON.parse(JSON.stringify(existingObject));
                    }

                    temporaryChangeLogObject.updatedFields = temporaryUpdatedFieldsString;

                    // Fetch data from users table instead of custom making

                    temporaryDataObject = await User.findOne(
                        {
                            where:
                            {
                                id: userId
                            }
                        }
                    );

                    temporaryDataObject = temporaryDataObject.toJSON();

                    // console.log('temporaryDataObject', temporaryDataObject);

                    // temporaryChangeLogObject.data = temporaryDataObject;

                    // console.log('temporaryChangeLogObject', temporaryChangeLogObject);
                }

                // New code ends here
        
                if (currentUpdatedAt > existingUpdatedAt)
                {
                    // emailMap[email] = currentObject;

                    if(currentAction == action.UPDATE && existingAction == action.UPDATE)
                    {
                        emailMap[email] = temporaryChangeLogObject;
                    }
                    else
                    {   
                        emailMap[email] = currentObject;
                    }
                }
            }
            else
            {
                emailMap[email] = currentObject;
            }
        }

        console.log('emailMap', emailMap);

        let filteredArray = Object.values(emailMap);

        console.log('filteredArray', filteredArray);

        for(let i=0; i<=filteredArray.length-1; i++)
        {
            filteredArray[i].updatedFields = filteredArray[i].updatedFields != null ? filteredArray[i].updatedFields.split(',').map(item => item.trim()) : null;
        }

        res.status(200).send(
            {
                success: true,
                message: 'getChangeLogs method is called',
                data: filteredArray
            }
        );
    }
    catch(error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getChangeLogs method is called',
                error: error.toString()
            }
        );
    }
};

getChangeLogsV3 = async (req, res) =>
{
    try
    {
        const { timeStamp } = req.body;

        // Fetching records from ChangeLog table which are not synced yet
        // and have updatedAt value greater than input timestamp value

        let changeLogData = await ChangeLog.findAll(
            {
                where:
                {
                    updatedAt:
                    {
                        [Op.gte]: new Date(timeStamp)
                    },
                    isSynced: false
                }
            }
        );

        changeLogData = changeLogData.map(record => record.toJSON());

        // console.log('changeLogData', changeLogData);

        // Converting 'data' field object coming from ChangeLog table records from String to Object
        // And fetching IDs of ChangeLog table records in an array

        let changeLogDataIDs = [];

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            changeLogData[i].data = JSON.parse(changeLogData[i].data);

            changeLogDataIDs.push(changeLogData[i].id);
        }

        // console.log('changeLogDataIDs', changeLogDataIDs);

        // Updating fetched ChangeLogs table records to mark them as synced

        const updateChangeLogs = await ChangeLog.update(
            {
                isSynced: true
            },
            {
                where:
                {
                    id: changeLogDataIDs
                }
            }
        );

        // console.log('updateChangeLogs', updateChangeLogs);

        // Creating a map object
        // In this map object we will have Email IDs which are present in changeLogs array as keys.
        // And the values against these email keys will be arrays containing objects 
        // for each action which is performed and is present for that particular email ID

        let emailMap1 = {};

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            const currentObject = changeLogData[i];

            // console.log('currentObject', currentObject);
            
            const email = currentObject.data.email;

            if(emailMap1.hasOwnProperty(email))
            {
                emailMap1[email].push(currentObject);  
            }
            else
            {
                emailMap1[email] = [currentObject];
            }
        }

        console.log('emailMap1', emailMap1);

        // Parsing through the Email Map object
        // Parsing through the array of each object and checking if action is UPDATE or DELETE
        // Parsing through the updatedFields array of each object of action type UPDATE or DELETE
        // While parsing through each updatedFields array, we collect the field name and store it one array
        // This array is being stored in a seperate Email Map Object containing same Email keys as previous map object
        // This array will contain only unique field names
        // If action is DELETE then 'isActive' field name is being added

        let emailMap2 = {};

        for (const email in emailMap1)
        {
            let emailArray = emailMap1[email];

            let updatedFieldsArray = [];

            for(let i=0; i<=emailArray.length-1; i++)
            {
                let tempAction = emailArray[i].action;
                
                if(tempAction == action.UPDATE)
                {
                    let updatedFieldsString = emailArray[i].updatedFields;

                    if(updatedFieldsString != null)
                    {
                        let tempArray = updatedFieldsString.split(',').map(s => s.trim());

                        tempArray.forEach(item =>
                        {
                            if (!updatedFieldsArray.includes(item))
                            {
                                updatedFieldsArray.push(item);
                            }
                        });
                    }
                }

                if(tempAction == action.DELETE)
                {
                    if (!updatedFieldsArray.includes('isActive'))
                    {
                        updatedFieldsArray.push('isActive');
                    }
                }
            }

            emailMap2[email] = updatedFieldsArray;
        }

        console.log('emailMap2', emailMap2);

        // Parsing through the Email Map object
        // Parsing through the array of each object and filtering each array
        // to keep only a single object with the latest updatedAt date

        let emailMap3 = {};

        for (const email in emailMap1)
        {
            let emailArray = emailMap1[email];

            let latestObject = emailArray[0];

            for (let i = 1; i <= emailArray.length-1; i++)
            {
                if (new Date(emailArray[i].updatedAt) > new Date(latestObject.updatedAt))
                {
                    latestObject = emailArray[i];
                }
            }

            emailMap3[email] = latestObject;
        }

        console.log('emailMap3', emailMap3);

        // Merging the new email map containing only updatedFields array with the existing email map

        for (const email in emailMap2)
        {
            if (emailMap3.hasOwnProperty(email))
            {
                emailMap3[email].updatedFields = emailMap2[email];
            }
        }

        console.log('Merged emailMap3', emailMap3);

        // Converting email map object to an array of object
        // Here values of each email object in the map is added to the filteredArray
        
        let filteredArray = Object.values(emailMap3);

        res.status(200).send(
            {
                success: true,
                message: 'getChangeLogs method is called',
                data: filteredArray
            }
        );
    }
    catch(error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getChangeLogs method is called',
                error: error.toString()
            }
        );
    }
};

getChangeLogsV4 = async (req, res) =>
{
    try
    {
        const { timeStamp } = req.body;

        // Fetching records from ChangeLog table which are not synced yet
        // and have updatedAt value greater than input timestamp value

        let changeLogData = await ChangeLog.findAll(
            {
                where:
                {
                    updatedAt:
                    {
                        [Op.gte]: new Date(timeStamp)
                    },
                    isSynced: false
                }
            }
        );

        changeLogData = changeLogData.map(record => record.toJSON());

        // console.log('changeLogData', changeLogData);

        // Converting data object coming from ChangeLog table records from String to Object
        // And fetching IDs of ChangeLog table records in an array

        let changeLogDataIDs = [];

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            changeLogData[i].data = JSON.parse(changeLogData[i].data);

            changeLogDataIDs.push(changeLogData[i].id);
        }

        // console.log('changeLogDataIDs', changeLogDataIDs);

        // Updating fetched ChangeLogs table records to mark them as synced

        const updateChangeLogs = await ChangeLog.update(
            {
                isSynced: true
            },
            {
                where:
                {
                    id: changeLogDataIDs
                }
            }
        );

        // console.log('updateChangeLogs', updateChangeLogs);

        let emailMap1 = {};

        for(let i=0; i<=changeLogData.length-1; i++)
        {
            const currentObject = changeLogData[i];

            // console.log('currentObject', currentObject);
            
            const email = currentObject.data.email;

            if(emailMap1.hasOwnProperty(email))
            {
                emailMap1[email].push(currentObject);  
            }
            else
            {
                emailMap1[email] = [currentObject];
            }
        }

        console.log('emailMap1', emailMap1);

        let emailMap2 = {};

        for (const email in emailMap1)
        {
            let emailArray = emailMap1[email];

            let updatedFieldsArray = [];

            for(let i=0; i<=emailArray.length-1; i++)
            {
                let tempAction = emailArray[i].action;
                
                if(tempAction == action.UPDATE)
                {
                    let updatedFieldsString = emailArray[i].updatedFields;

                    if(updatedFieldsString != null)
                    {
                        let tempArray = updatedFieldsString.split(',').map(s => s.trim());

                        tempArray.forEach(item =>
                        {
                            let itemFound = false;

                            for (let obj of updatedFieldsArray)
                            {
                                if(obj.hasOwnProperty(item))
                                {
                                    obj[item] = new Date(emailArray[i].updatedAt);
                                    itemFound = true;
                                    break;
                                }    
                            }

                            if(!itemFound)
                            {
                                let tempObject =
                                {
                                    [item]: new Date(emailArray[i].updatedAt)
                                }

                                updatedFieldsArray.push(tempObject)
                            }
                        });
                    }
                }

                if(tempAction == action.DELETE)
                {
                    let itemFound = false;
                    
                    for (let obj of updatedFieldsArray)
                    {
                        if(obj.hasOwnProperty('isActive'))
                        {
                            obj['isActive'] = new Date(emailArray[i].updatedAt);
                            itemFound = true;
                            break;
                        }    
                    }

                    if(!itemFound)
                    {
                        let tempObject =
                        {
                            ['isActive']: new Date(emailArray[i].updatedAt)
                        }

                        updatedFieldsArray.push(tempObject)
                    }
                }
            }

            emailMap2[email] = updatedFieldsArray;
        }

        console.log('emailMap2', emailMap2);

        let emailMap3 = {};

        for (const email in emailMap1)
        {
            let emailArray = emailMap1[email];

            let latestObject = emailArray[0];

            for (let i = 1; i <= emailArray.length-1; i++)
            {
                if (new Date(emailArray[i].updatedAt) > new Date(latestObject.updatedAt))
                {
                    latestObject = emailArray[i];
                }
            }

            emailMap3[email] = latestObject;
        }

        console.log('emailMap3', emailMap3);

        for (const email in emailMap2)
        {
            if (emailMap3.hasOwnProperty(email))
            {
                emailMap3[email].updatedFields = emailMap2[email];
            }
        }

        console.log('Merged emailMap3', emailMap3);
        
        let filteredArray = Object.values(emailMap3);

        for(let i=0; i<=filteredArray.length-1; i++)
        {
            filteredArray[i].updatedFields = filteredArray[i].updatedFields.reduce((acc, obj) =>
            {
                let key = Object.keys(obj)[0];
                acc[key] = obj[key];
                return acc;
            }, {});
        }

        res.status(200).send(
            {
                success: true,
                message: 'getChangeLogs method is called',
                data: filteredArray
            }
        );
    }
    catch(error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getChangeLogs method is called',
                error: error.toString()
            }
        );
    }
};

syncData = async (req, res) =>
{
    try
    {
        // BE will recieve an array of objects from FE
        // Objects will be from changeLog table
        // Incoming data will be arranged in increasing order of createdAt

        const { changeLogArray } = req.body;

        // console.log('changeLogArray', changeLogArray);

        // We will run a for loop on this incoming data

        const changeLogArrayParsed = typeof(changeLogArray) != 'object' ? JSON.parse(changeLogArray) : changeLogArray;

        console.log('changeLogArrayParsed', changeLogArrayParsed);

        // Incoming array of objects from FE will contain an action in each object
        // Based on the action, whether it is INSERT, UPDATE or DELETE
        // corresponding action will be performed in the BE
        // For each action an object will be added to BE ChangeLogs table
        // and respective action will be performed in the users table
        // isSynced will be set as true only while creating records in ChangeLogs table
        // Note: We are not copy pasting object received from FE directly to ChangeLogs table
        // instead we are creating them manually after making changes in the Users table
        // This is because User ID to be stored in ChangeLogs will be different for BE and FE

        if(changeLogArrayParsed != undefined)
        {
            for(let i=0; i<=changeLogArrayParsed?.length-1; i++)
            {
                let inputAction = changeLogArrayParsed[i].action;
                let inputTableName = changeLogArrayParsed[i].tableName;
                let data = changeLogArrayParsed[i].data;

                let isActive = changeLogArrayParsed[i].data.isActive;

                // console.log('inputAction', inputAction);
                // console.log('inputTableName', inputTableName);
                // console.log('data', data);

                let updatedFieldsArray = changeLogArrayParsed[i].updatedFields;

                let updatedFieldsString = updatedFieldsArray.map(str => str.trim()).join(',');

                console.log('updatedFieldsString', updatedFieldsString);

                if(inputAction == action.INSERT)
                {
                    const user = await User.findOne(
                        {
                            where:
                            {
                                email: data.email
                            }
                        }
                    );
       
                    // console.log('user', user);

                    if(user)
                    {
                        continue;
                    }
                    
                    const userData = await User.create(
                        {
                            username: data.username,
                            email: data.email,
                            age: data.age,
                            city: data.city,
                            isActive: true,
                            createdAt: new Date(data.createdAt),
                            updatedAt: new Date(data.updatedAt)
                        }
                    );
            
                    // console.log('userData', userData);
            
                    const changeLogData = await ChangeLog.create(
                        {
                            userId: userData.id,
                            action: inputAction,
                            tableName: inputTableName,
                            isSynced: true,
                            data: JSON.stringify(data),
                            updatedFields: null,
                            createdAt: new Date(changeLogArrayParsed[i].createdAt),
                            updatedAt: new Date(changeLogArrayParsed[i].updatedAt)
                        }
                    );
            
                    // console.log('changeLogData', changeLogData);
                }
                else if(inputAction == action.UPDATE)
                {
                    const user = await User.findOne(
                        {
                            where:
                            {
                                email: data.email
                            }
                        }
                    );
       
                    // console.log('user', user);

                    if(user)
                    {
                        user.username = data.username;
                        user.age = data.age;
                        user.city = data.city;
                        user.isActive = isActive;
                        user.updatedAt = new Date(data.updatedAt);
                        
                        const userData = await user.save();

                        // console.log('usersData', userData);

                        const changeLogData = await ChangeLog.create(
                            {
                                userId: userData.id,
                                action: inputAction,
                                tableName: inputTableName,
                                isSynced: true,
                                data: JSON.stringify(data),
                                updatedFields: updatedFieldsString,
                                createdAt: new Date(changeLogArrayParsed[i].createdAt),
                                updatedAt: new Date(changeLogArrayParsed[i].updatedAt)
                            }
                        );
                
                        // console.log('changeLogData', changeLogData);
                    }
                    else
                    {
                        const userData = await User.create(
                            {
                                username: data.username,
                                email: data.email,
                                age: data.age,
                                city: data.city,
                                isActive: isActive,
                                createdAt: new Date(data.createdAt),
                                updatedAt: new Date(data.updatedAt)
                            }
                        );
                
                        // console.log('userData', userData);
                
                        const changeLogData = await ChangeLog.create(
                            {
                                userId: userData.id,
                                action: inputAction,
                                tableName: inputTableName,
                                isSynced: true,
                                data: JSON.stringify(data),
                                updatedFields: updatedFieldsString,
                                createdAt: new Date(changeLogArrayParsed[i].createdAt),
                                updatedAt: new Date(changeLogArrayParsed[i].updatedAt)
                            }
                        );
                
                        // console.log('changeLogData', changeLogData);
                    }
                }
                else if(inputAction == action.DELETE)
                {
                    const user = await User.findOne(
                        {
                            where:
                            {
                                email: data.email
                            }
                        }
                    );
       
                    // console.log('user', user);

                    if(user)
                    {
                        user.username = data.username;
                        user.age = data.age;
                        user.city = data.city;
                        user.isActive = false;
                        user.updatedAt = new Date(data.updatedAt);

                        const userData = await user.save();

                        // console.log('userData', userData);

                        const changeLogData = await ChangeLog.create(
                            {
                                userId: userData.id,
                                action: inputAction,
                                tableName: inputTableName,
                                isSynced: true,
                                data: JSON.stringify(data),
                                updatedFields: updatedFieldsString, 
                                createdAt: new Date(changeLogArrayParsed[i].createdAt),
                                updatedAt: new Date(changeLogArrayParsed[i].updatedAt)
                            }
                        );
                
                        // console.log('changeLogData', changeLogData);
                    }
                    else
                    {
                        const userData = await User.create(
                            {
                                username: data.username,
                                email: data.email,
                                age: data.age,
                                city: data.city,
                                isActive: isActive,
                                createdAt: new Date(data.createdAt),
                                updatedAt: new Date(data.updatedAt)
                            }
                        );
                
                        // console.log('userData', userData);
                
                        const changeLogData = await ChangeLog.create(
                            {
                                userId: userData.id,
                                action: inputAction,
                                tableName: inputTableName,
                                isSynced: true,
                                data: JSON.stringify(data),
                                updatedFields: updatedFieldsString,
                                createdAt: new Date(changeLogArrayParsed[i].createdAt),
                                updatedAt: new Date(changeLogArrayParsed[i].updatedAt)
                            }
                        );
                
                        // console.log('changeLogData', changeLogData);
                    }
                }
            }
        }

        res.status(200).send(
            {
                success: true,
                message: 'syncData method is called'
            }
        );
    }
    catch(error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'syncData method is called',
                error: error.toString()
            }
        );
    }
};

module.exports =
{
    getChangeLogs,
    getChangeLogsV2,
    getChangeLogsV3,
    getChangeLogsV4,
    syncData
};