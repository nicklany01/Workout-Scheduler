FROM mysql:latest

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=your_database
ENV MYSQL_USER=your_user
ENV MYSQL_PASSWORD=your_password

# Copy SQL scripts to initialize the database
COPY ./sql-scripts/ /docker-entrypoint-initdb.d/

# Expose the MySQL port
EXPOSE 3306

# CMD instruction to start MySQL server
CMD ["mysqld"]