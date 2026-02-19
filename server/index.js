const keys = require('./keys')


//Express setup
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Postges setup
const { Pool} = require('pg')
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', ()=>console.log('LOST PG CONNECTION'));


pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

//Redis Client setup (redis v5+)
const redis = require('redis');
const redisClient = redis.createClient({
    socket: {
        host: keys.redisHost,
        port: keys.redisPort,
        reconnectStrategy: () => 1000
    }
});
redisClient.on('error', (err) => console.error('Redis client error', err));

const redisPublisher = redisClient.duplicate();
redisPublisher.on('error', (err) => console.error('Redis publisher error', err));

const redisReady = (async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    if (!redisPublisher.isOpen) {
        await redisPublisher.connect();
    }
})();

//Express route handlers

app.get('/', (req, res)=>{
    res.send('Hi');
});

app.get('/values/all', async (req, res)=>{
    const values = await pgClient.query('SELECT * from values')

    res.send(values.rows);
});

app.get('/values/current', async (req, res)=>{
    try {
        await redisReady;
        const values = await redisClient.hGetAll('values');
        res.send(values || {});
    } catch (err) {
        console.error('Failed to fetch current values from Redis', err);
        res.status(500).send({ error: 'Unable to fetch current values' });
    }
});

app.post('/values', async(req, res)=>{
    const  index = req.body.index;

    if(parseInt(index)>40){
        return res.status(422).send('Index too high');
    }

    try {
        await redisReady;
        await redisClient.hSet('values', index, 'Nothing yet!');
        await redisPublisher.publish('insert', index);
        pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
        res.send({working:true});
    } catch (err) {
        console.error('Failed to store value', err);
        res.status(500).send({ error: 'Unable to store value' });
    }

});

const startServer = async () => {
    try {
        await redisReady;
        app.listen(5000, () => {
            console.log('Listening');
        });
    } catch (err) {
        console.error('Failed to start server', err);
    }
};

startServer();