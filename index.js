const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const Moment = require('moment-timezone');
const app = express();
const sharp = require('sharp');
const multer = require('multer');
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, res, cb) => {
            cb(null, './public/images');
        },
        filename: (req, file, cb) => {
            cb(null, 'background.jpg');
        }
    })
});
const port = 3000;
const CronJob = require('cron').CronJob;
const sequelize = require('./dbschema/model.js');

new CronJob('5 0 0 * * *', () => {
    const Timer = sequelize.models.timer;
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const start = new Date(today);
    const end = new Date(today);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 0);

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        Timer.findAll({
            transaction: t,
            where: {
                deleted: false,
                createdAt: {
                    [Sequelize.Op.between]: [start, end],
                },
            }
        }).then((timers) => {
            const promise = [];
            timers.forEach((time) => {
                const p = time
                    .update({
                        deleted: true,
                    }, { transaction: t })
                    .then((deleted) => {
                        return Timer.create({
                            start: deleted.start,
                            end: deleted.end,
                            color: deleted.color,
                        }, { transaction: t });
                    });
                promise.push(p);
            });
            Promise.all(promise)
                .then(() => {
                    t.commit();
                }).catch(() => {
                    t.rollback();
                });
        });
    });
}, null, true, 'Asia/Taipei');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.findAll({
            where: { deleted: false },
            transaction: t,
            order: [['start', 'ASC']]
        }).then((timers) => {
            res.render('index', { timers: timers });
            t.commit();
        }).catch(() => {
            res.render('index', { timers: [] });
            t.rollback();
        });
    });
});

app.get('/gettimer', (req, res) => {
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.findAll({
            where: { deleted: false },
            transaction: t,
            order: [['start', 'ASC']]
        }).then((timers) => {
                res.render('task', { timers: timers });
                t.commit();
            }).catch((e) => {
                res.render('task', { timers: [] });
                t.rollback();
            });
    });
});

app.get('/gettimerAPI', (req, res) => {
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.findAll({
            transaction: t,
            where: { deleted: false },
            order: [['start', 'ASC']]
        }).then((times) => {
                res.send({ times: times });
                t.commit();
            }).catch(() => {
                res.send({ times: [] });
                t.rollback();
            });
    });
});

app.post('/addtimer', (req, res) => {
    const { start, end, color } = req.body;
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.count({
            transaction: t,
            where: { deleted: false }
        }).then((num) => {
                if (num < 4) {
                    return Timer.create({
                        start: start,
                        end: end,
                        color: color,
                        transaction: t,
                    });
                } else {
                    throw 'Only allow 4 timers';
                }
            })
            .then((timer) => {
                t.commit();
                res.end();
            })
            .catch((err) => {
                t.rollback();
                res.end();
            });
    });
});

app.post('/deltimer', (req, res) => {
    const { id } = req.body;
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.update({ deleted: true }, {
            where: { id: id },
            transaction: t,
        })
        .then(() => {
            t.commit();
            res.end();
        }).catch(() => {
            t.rollback();
            res.end();
        });
    });
});

app.post('/finish', (req, res) => {
    const { id, note } = req.body;
    const time = Moment.tz(new Date(), 'Asia/Taipei').format('HH:mm:ss');
    const Timer = sequelize.models.timer;

    sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    }).then((t) => {
        return Timer.update({
            note: note,
            recorded_time: time,
        }, {
            transaction: t,
            where: {
                id: id,
            },
        }).then(() => {
            t.commit();
            res.end();
        }).catch(() => {
            t.rollback();
            res.end();
        });
    });
});

app.post('/upload', upload.single('photo'), (req, res) => {
    const { file }  = req;
    sharp(file.path)
    .toFormat('jpg')
    .toFile('background.jpg')
    .then(() => {
        res.end();
    })
    .catch((e) => {
        res.status(400).end();
    });
})

app.listen(port, () => { console.log('start!'); });
