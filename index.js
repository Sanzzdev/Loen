const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const port = 3000;

const domain = 'https://flantnetwork.live';
const apikey = 'ptla_nokjOLuhVyCMgKmsKaYPixOXMfmJUZ5bSO14M6TQs8G';

const eggsnya = '16';
const location = '1';
const creator = 'xlanzdev';

const generateRandomPassword = (length = 12) => {
    return crypto.randomBytes(length / 2).toString('hex');
};

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/claim', async (req, res) => {
    const { usernm } = req.query;

    if (!usernm) {
        return res.status(400).json({ error: 'Missing "usernm" parameter.' });
    }

    const last_name = usernm.slice(-3);
    const password = generateRandomPassword(); 
    const email = `${usernm}@express.com`;

    try {
        const userResponse = await axios.post(`${domain}/api/application/users`, {
            username: usernm,
            first_name: usernm,
            last_name: last_name,
            email: email,
            password: password,
            root_admin: false,
            language: 'en'
        }, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${apikey}`,
                "Content-Type": "application/json"
            }
        });

        if (userResponse.status === 201) {
            const userData = userResponse.data.attributes;
            const serverResponse = await axios.post(`${domain}/api/application/servers`, {
                name: `${usernm}_server`,
                user: userData.id,
                egg: eggsnya,
                docker_image: 'ghcr.io/pterodactyl/yolks:nodejs_18',
                startup: 'npm start',
                limits: {
                    memory: 0,
                    swap: 0,
                    disk: 0,
                    io: 500,
                    cpu: 0
                },
                environment: {
                    STARTUP_CMD: 'npm start'
                },
                feature_limits: {
                    databases: 1,
                    backups: 2
                },
                deploy: {
                    locations: [location],
                    dedicated_ip: false,
                    port_range: []
                }
            }, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${apikey}`,
                    "Content-Type": "application/json"
                }
            });

            if (serverResponse.status === 201) {
                const serverData = serverResponse.data.attributes;

                return res.json({
                    creator: creator,
                    username: usernm,
                    password: password,
                    domain: domain
                });
            } else {
                return res.status(500).json({ error: 'Failed to create server', details: serverResponse.data });
            }
        } else {
            return res.status(500).json({ error: 'Failed to create user', details: userResponse.data });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to the API', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});