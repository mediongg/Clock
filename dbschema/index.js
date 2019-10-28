const Sequelize = require('sequelize');

const sequelize = new Sequelize('clock', 'medion', '', {
    host: 'localhost',
    dialect: 'postgres'
});

const clock = sequelize.define('timer', {
    start: {
        type: Sequelize.ARRAY(Sequelize.TIME),
        allowNull: true
    },
    end: {
        type: Sequelize.ARRAY(Sequelize.TIME),
        allowNull: true
    }
});

const checkin = sequelize.define('checkin', {
    state: {
        type: Sequelize.ARRAY(Sequelize.BOOLEAN),
        allowNull: true
    },
});

checkin.belongsTo(clock);

sequelize.sync({
    force: true,
});


// sequelize
// .authenticate()
// .then(() => {
//     console.log('connection success');
// })
// .catch(err => {
//     console.log('connection fail');
// })