CREATE DATABASE IF NOT EXISTS workoutdb;
USE workoutdb;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

INSERT INTO users (name) VALUES ('John'), ('Jane'), ('Bob');
