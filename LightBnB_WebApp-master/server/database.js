const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  return pool.query(`
  SELECT * FROM users
  WHERE email = $1
  `, [email])
    .then(res => {
      if (res.rows.length) {

        return res.rows[0]
      }

      else {
        return null
      }
    })
}
exports.getUserWithEmail = getUserWithEmail;

// 1 | Devin Sanders        | tristanjacobs@gmail.com         | $2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1
  `, [id])
    .then(res => {
      if (res.rows.length) {
        return res.rows[0]
      }
      else {
        return null
      }
    })
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool.query(`
  INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;
  `, [user.name, user.email, user.password])
    .then(res => 
      res.rows[0]
    )

}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
  SELECT DISTINCT properties.*  FROM reservations 
  JOIN property_reviews ON reservations.id = property_reviews.reservation_id
  JOIN properties ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  LIMIT $2;
  `, [guest_id, limit])
  .then(res => res.rows)
}
exports.getAllReservations = getAllReservations;

// Lloyd Jefferson      | asherpoole@gmx.com    

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  console.log('OPTIONS', options)
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    if (options.city) {
    queryString += `AND properties.cost_per_night > $${queryParams.length} `;
    } else {
      queryString += `WHERE properties.cost_per_night  > $${queryParams.length} `;
    }
  }



  if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    if (options.city || options.minimum_price_per_night) {
    queryString += `AND properties.cost_per_night < $${queryParams.length} `;
    } else {
      queryString += `WHERE properties.cost_per_night  < $${queryParams.length} `;
    }
  }

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    if (options.city || options.minimum_price_per_night || options.maximum_price_per_night) {
    queryString += `HAVING average_rating > $${queryParams.length} `;
    } else {
      queryString += `WHERE properties.average_rating  > $${queryParams.length} `;
    }
  }
  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams)
  .then(res => res.rows)
};
exports.getAllProperties = getAllProperties;

// SELECT properties.id, properties.title, properties.cost_per_night, avg(property_reviews.rating) FROM properties
// JOIN property_reviews ON property_reviews.property_id = properties.id
// GROUP BY properties.id, properties.title, properties.cost_per_night
// HAVING avg(property_reviews.rating) >= 4 AND properties.city LIKE '%Vancouver%'
// ORDER BY properties.cost_per_night
// LIMIT 10;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  console.log(property)
  return pool.query(`
  INSERT INTO properties (
    title, description, thumbnail_photo_url, cover_photo_url,  cost_per_night, street, city,  province, post_code,  country, parking_spaces, number_of_bathrooms, number_of_bedrooms) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;
  `, [property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
    .then(res => 
      res.rows[0]
    )
}
exports.addProperty = addProperty;
