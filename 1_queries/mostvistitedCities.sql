properties
reservations


SELECT city, count(reservations.property_id) as total_reservations FROM properties
JOIN reservations ON properties.id = property_id
GROUP BY city
ORDER BY count(reservations.property_id) DESC;