
SELECT properties.id, properties.title, properties.cost_per_night, avg(property_reviews.rating) FROM properties
JOIN property_reviews ON property_reviews.property_id = properties.id
GROUP BY properties.id, properties.title, properties.cost_per_night
HAVING avg(property_reviews.rating) >= 4 AND properties.city LIKE '%Vancouver%'
ORDER BY properties.cost_per_night
LIMIT 10;