CREATE DATABASE IF NOT EXISTS workout_db;
USE workout_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO users (name) VALUES ('John'), ('Jane'), ('Bob');
