CREATE DATABASE workout;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    preferredname VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE logs (
    id DATE PRIMARY KEY,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    UNIQUE KEY (user_id, name),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE exercise_logs (
    log_id DATE,
    exercise_id INT,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight FLOAT(5, 5) NOT NULL,
    PRIMARY KEY (log_id, exercise_id),
    FOREIGN KEY (log_id) REFERENCES logs(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

CREATE TABLE muscles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE exercise_muscles (
    exercise_id INT,
    muscle_id INT,
    PRIMARY KEY (exercise_id, muscle_id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id),
    FOREIGN KEY (muscle_id) REFERENCES muscles(id)
);
