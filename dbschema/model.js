const Sequelize = require('sequelize');

const sequelize = new Sequelize('clock', 'medion', '', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

const timer = sequelize.define('timer', {
    start: {
        type: Sequelize.TIME,
        allowNull: true
    },
    end: {
        type: Sequelize.TIME,
        allowNull: true
    },
    recorded_time: {
        type: Sequelize.TIME,
        allowNull: true
    },
    note: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    color: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: true
    }, 
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
        allowNull: true
    },
});

module.exports = sequelize;
// sequelize
// .authenticate()
// .then(() => {
//     console.log('connection success');
// })
// .catch(err => {
//     console.log('connection fail');
// })