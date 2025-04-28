package com.savi.apj;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseHelper {
    private static final String DB_URL = "jdbc:sqlite:database/vendors.db";
    private static Connection connection = null;
    
    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
                Class.forName("org.sqlite.JDBC");
                connection = DriverManager.getConnection(DB_URL);
                // Enable foreign keys
                connection.createStatement().execute("PRAGMA foreign_keys = ON");
            } catch (ClassNotFoundException e) {
                throw new SQLException("SQLite JDBC driver not found", e);
            }
        }
        return connection;
    }
    
    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    public static void initializeDatabase() {
        try (Connection conn = getConnection()) {
            // Create vendors table
            conn.createStatement().execute(
                "CREATE TABLE IF NOT EXISTS vendors (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "name TEXT NOT NULL," +
                "latitude REAL NOT NULL," +
                "longitude REAL NOT NULL," +
                "neighborhood TEXT," +
                "rating REAL," +
                "description TEXT," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")"
            );
            
            // Create reviews table
            conn.createStatement().execute(
                "CREATE TABLE IF NOT EXISTS reviews (" +
                "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                "vendor_id INTEGER," +
                "rating INTEGER NOT NULL," +
                "comment TEXT," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
                "FOREIGN KEY (vendor_id) REFERENCES vendors(id)" +
                ")"
            );
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
