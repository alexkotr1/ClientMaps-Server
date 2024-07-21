const pool = require('./DBClient'),
{ v4: uuidv4 } = require('uuid'),
logger = require("./Logger.js");
fs=require('fs'),
path = require('path');

class Client {
  constructor(name, phone, comments, latitude, longitude, names, place = null,id = null, has_image = false) {
    this.name = name;
    this.phone = phone;
    this.comments = comments;
    this.latitude = latitude;
    this.longitude = longitude;
    this.names = names;
    this.place = place;
    this.id = id ? id : uuidv4();
    this.has_image = has_image;
  }

  async save() {
    if (await Client.clientExists(this.name)) return 409
    const queryText = `
    INSERT INTO clients (id, name, phone, comments, latitude, longitude, names, place)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id;
    `;
  
    const values = [
      this.id,
      this.name,
      this.phone,
      this.comments,
      this.latitude,
      this.longitude,
      this.names,
      this.place
    ];
  
    try {
      const result = await pool.query(queryText, values);
      console.log('Inserted client with ID:', result.rows[0].id);
      return 200;
    } catch (err) {
      console.error('Error inserting client:', err);
      return 404;
    }
  }
  
  static dataToClient(data){
    const client = new Client(data.name, data.phone, data.comments, data.latitude, data.longitude, data.names, data.place)
    return client
  }

  clientToData(){
    var data = {}
    data.name = this.name;
    data.phone = this.phone;
    data.comments = this.comments;
    data.latitude = this.latitude;
    data.longitude = this.longitude;
    data.names = this.names;
    data.place = this.place;
    data.id = this.id;
    data.has_image = this.has_image;
    return data
  }
  static async delete(id) {
    const queryText = `
      DELETE FROM clients WHERE id = $1;
    `;

    try {
      await pool.query(queryText, [id]);
      logger.info("Deleting client with ID: " + id)
      return 200
    } catch (err) {
      logger.error('Error deleting client:', err);
      return 404
    }
  }
  async update(id) {
    if (await Client.clientExists(this.name, id)) return 409
    const queryText = `
    UPDATE clients
    SET name = $1, phone = $2, comments = $3, latitude = $4, longitude = $5, names = $6, place = $7
    WHERE id = $8;
  `;
    const values = [
      this.name,
      this.phone,
      this.comments,
      this.latitude,
      this.longitude,
      this.names,
      this.place,
      id
    ];

    try {
      const result = await pool.query(queryText, values);
      if (result.rowCount > 0) {
        logger.info(`DB - Updated client with ID: ${id}`);
        return 200
      } else {
        logger.warn(`DB - No client found with ID: ${id}`);
        return 400
      }
    } catch (err) {
      logger.error('DB - Error updating client:', err);
      return 404
    }
  }
  static async retrieveClient(id) {
    const queryText = `
      SELECT * FROM clients WHERE id = $1;
    `;
    try {
      const result = await pool.query(queryText, [id]);
      logger.info('DB - Retrieved client:', result.rows);
      if (result.rows.length > 0) {
        return new Client(
          result.rows[0].name,
          result.rows[0].phone,
          result.rows[0].comments,
          result.rows[0].latitude,
          result.rows[0].longitude,
          result.rows[0].names,
          result.rows[0].place,
          result.rows[0].id
        );
      } else {
        return null;
      }
    } catch (err) {
      logger.warn('DB - Error retrieving client:', err);
      return null;
    }
}
  static async getAllClients() {
    const queryText = `
      SELECT * FROM clients;
    `;
    try {
      const result = await pool.query(queryText);
      return result.rows.map(row => {
        const filePath = path.join(__dirname, 'uploads', row.id + ".jpg");
        return new Client(row.name, row.phone, row.comments, row.latitude, row.longitude, row.names, row.place, row.id, fs.existsSync(filePath))
    });
    } catch (err) {
      logger.error('Error retrieving all clients:', err);
      return [];
    }
  }

  static async clientExists(name, id = null) {
    let queryText = 'SELECT * FROM clients WHERE name = $1';
    let values = [name];
    if (id !== null) {
      queryText += ' AND id <> $2';
      values.push(id);
    }
    try {
      const result = await pool.query(queryText, values);
      console.log('Client exists result:', result.rows);
      return result.rowCount > 0;
    } catch (err) {
      console.error('Error checking client existence:', err);
      return false;
    }
  }
  static async deleteAll() {
    const queryText = `
      TRUNCATE clients;
    `;

    try {
      await pool.query(queryText);
      logger.warn('Deleted all clients.');
    } catch (err) {
      logger.error('Error deleting all clients:', err);
    }
  }
  

}

module.exports = Client;
