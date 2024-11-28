import fetch from 'node-fetch';
import express from 'express';
import cors from 'cors';
import path from 'path';
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.set('json spaces', 2);

const apikey = "ptla_Gzs8y6dC3UM9cFImxrzSPpYtnzVL4J35usrjXzyHHTL";
const domain = "https://server.xlanznet.site";
const eggsnya = "15";
const location = "1";

const randompass = () => Math.random().toString(36).slice(-8);

app.use((req, res, next) => {
    if (req.path === '/index.js') {
        res.status(403).send('Forbidden');
    } else {
        next();
    }
});

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post('/Create', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) return res.status(400).json({ message: "Parameter 'username' wajib diisi!" });

        const email = `${username}@express.site`;
        const password = randompass();
        const name = `[ RAM UNLI ] ${username.toUpperCase()}`;

        const createUserResponse = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`,
            },
            body: JSON.stringify({
                email,
                username,
                first_name: username,
                last_name: username,
                language: "en",
                password,
            }),
        });

        const userData = await createUserResponse.json();
        if (userData.errors) return res.status(400).json(userData.errors[0]);

        const user = userData.attributes;

        const eggResponse = await fetch(`${domain}/api/application/nests/5/eggs/${eggsnya}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`,
            },
        });

        const eggData = await eggResponse.json();
        const startup_cmd = eggData.attributes.startup;

        const createServerResponse = await fetch(`${domain}/api/application/servers`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apikey}`,
            },
            body: JSON.stringify({
                name,
                description: `Expired Date: ${(new Date()).toLocaleDateString('id-ID')}`,
                user: user.id,
                egg: parseInt(eggsnya),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_19",
                startup: startup_cmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start",
                },
                limits: {
                    memory: "0",
                    swap: 0,
                    disk: "0",
                    io: 500,
                    cpu: "0",
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 1,
                },
                deploy: {
                    locations: [parseInt(location)],
                    dedicated_ip: false,
                    port_range: [],
                },
            }),
        });

        const serverData = await createServerResponse.json();
        if (serverData.errors) return res.status(400).json(serverData.errors[0]);

        const server = serverData.attributes;

        return res.status(200).json({
            message: "Accounts Is Created",
            user: {
                username: user.username,
                password,
                email,
            },
            server: {
                id: server.id,
                name: server.name,
                description: server.description,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan!", error: error.message });
    }
});

app.get('/Create', (req, res) => {
    res.status(405).json({ message: "Method Not Allowed" });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});