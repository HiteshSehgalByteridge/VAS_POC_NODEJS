
const express = require('express');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const PORT = 3000;

// const mySqlConnection = require('./database.js');

const { sequelize } = require('./sequelize.js');

// const { ChangeLog } = require('./models/changeLog.js');

const routes = require('./routes/index');

app.use('/', routes);

// app.listen(PORT, async () =>
// {
//     console.log(`Server is running at port: ${PORT}`);

//     mySqlConnection.connect((error) =>
//     {
//         if(error)
//         {
//             console.log('error', error);

//             throw error;
//         }

//         console.log('Database connected successfully');
//     });
// });

app.listen(PORT, async () =>
{
    console.log(`Server is running at port: ${PORT}`);

    await sequelize.authenticate();

    console.log('Database connected successfully');
 
    await sequelize.sync();
 
    console.log('All models were synchronized successfully');
});