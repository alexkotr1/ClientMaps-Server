const { error } = require('console');

const express = require('express'),
app = express(),
map = require('./map.json'),
shouldScrapData = true,
Client = require('./Client'),
logger = require('./Logger.js'),
NodeGeocoder = require("node-geocoder"),
config = require('./config.json'),
options = {
    provider: "google",
    apiKey:config.GOOGLE_API_KEY,
    formatter:null,
    language:'el'
},
geocoder = NodeGeocoder(options),
fs=require('fs')

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/scrapJSON/:key',async (req,res)=>{
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got GET request in /addClient/ with wrong API password.")
        return res.sendStatus(403)
    }
    var clients = await Client.getAllClients()
    try{
        const data = JSON.stringify(clients)
        fs.writeFileSync('./data.json',data);
        res.download('./data.json', (err) => {
            if (err) {
              console.error('Error downloading the file:', err);
              res.status(500).send('Error downloading the file');
            }
          });
    } catch(error){
        console.error(error);
    }

})

app.get('/addClient/:key/:text?', (req,res)=>{
    console.log("Received GET request")
    logger.info('Got GET request in /addClient/');
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got GET request in /addClient/ with wrong API password.")
        return res.sendStatus(403)
    }
    res.render('addClient', { text : req.params.text ? req.params.text : "" });
});

app.get('/:key', async (req,res)=>{
    logger.info('Got GET request in /');
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got GET request in / with wrong API password.")
        return res.sendStatus(403)
    }
    var clients = await Client.getAllClients()
    if (!clients.length) return res.render('index', { data: [] })
    clients.sort((a, b) => {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
     res.render('index', { data: clients.map(client => client.clientToData()) })
})

app.get('/edit/:id/:key', async (req,res)=>{
    logger.info('Got GET request in /addClient/');
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got POST request in /edit with wrong API password.")
        return res.sendStatus(403)
    }
    const client = await Client.retrieveClient(req.params.id)
    if (!client) return res.sendStatus(404)
    res.render('editClient', { data: client.clientToData() })
})

app.post('/add/:key', async (req, res) => {
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got POST request in /add with wrong API password.")
        return res.sendStatus(403)
    }    
    const data = req.body
    if (!correctData(data)) {
        logger.warn("Got POST request in /add with wrong data.")
        return res.sendStatus(404)
    }
    const client = Client.dataToClient(data)
    client.name = removeAccents(client.name).toUpperCase()
    const place = await geocoder.reverse({ lat: client.latitude, lon: client.longitude })
    client.place = place[0].city;
    console.log(client.place)
    const result = await client.save()
    logger.info("Adding a new client with ID:" + client.id);
    return res.sendStatus(result)
})


app.post('/data/:key', async (req, res) => {
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got POST request in /data with wrong API password.")
        return res.sendStatus(403)
    }     
    const clients = await Client.getAllClients()
    logger.info("Retrieving all data");
    console.log(clients[0].place)
    return res.send(JSON.stringify(clients.map(client => client.clientToData())))
})

app.post('/delete/:id/:key', async (req, res) => {
    if (req.params.key !== config.API_KEY) return res.sendStatus(403)
    const result = await Client.delete(req.params.id)
    logger.info('Deleting client with ID:' + req.params.id)
    return res.sendStatus(result)
})


app.post('/edit/:id/:key', async (req, res) => {
    if (req.params.key !== config.API_KEY) {
        logger.warn("Got POST request in /edit with wrong API password.")
        return res.sendStatus(403)
    }      
    const data = req.body;
    console.log(data)
    if (!correctData(data)) {
        logger.warn("Got POST request in /edit with wrong data.")
        return res.sendStatus(404)
    }
    const client = await Client.retrieveClient(req.params.id)
    if (client === null) {
        logger.warn("Got POST request in /edit but client is null")
        return res.sendStatus(404);
      }
    client.name = removeAccents(data.name).toUpperCase();
    client.phone = data.phone;
    client.comments = data.comments;
    client.latitude = data.latitude;
    client.longitude = data.longitude;
    client.names = data.names;
    const place = await geocoder.reverse({ lat: client.latitude, lon: client.longitude })
    client.place = place[0].city;
    logger.info("Edited client with ID: " + client.id + " to:\n" + client)
    const result = await client.update(req.params.id);
    return res.sendStatus(result)
})

app.listen(config.PORT, async () => {
    console.log(`Maps server listening on port ${config.PORT}`)
    if (!shouldScrapData) return undefined
    await Client.deleteAll();
    for (var x = 0; x < map.length; x++) {
        let item = map[x]
        let client = new Client(item.name,item.phone,item.comments,item.latitude,item.longitude,item.names,item.place)
        if (!client.place){
            const place = await geocoder.reverse({ lat: client.latitude, lon: client.longitude })
            client.place = place[0].city;
        }
        await client.save()
    }
})

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function randomInt(maximum, minimum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function correctData(data){
    return (data && data.name && data.latitude && data.longitude && data.names !== undefined && (data.phone.length || data.phone === '') && (data.comments.length || data.comments === ''))
}

function removeAccents(str) {
    const accentsMap = {
      'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
      'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω'
    };
  
    return str.split('').map(char => accentsMap[char] || char).join('');
  }