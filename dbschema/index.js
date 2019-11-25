const sequelize = require('./model');

sequelize.sync({
    force: true
});