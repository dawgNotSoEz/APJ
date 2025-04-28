package com.savi.apj;

import com.google.gson.Gson;
import spark.Route;
import static spark.Spark.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class VendorRoutes {
    private final Gson gson = new Gson();
    
    public void init() {
        // Get all vendors
        get("/api/vendors", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM vendors")) {
                
                ArrayList<Map<String, Object>> vendors = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> vendor = new HashMap<>();
                    vendor.put("id", rs.getInt("id"));
                    vendor.put("name", rs.getString("name"));
                    vendor.put("latitude", rs.getDouble("latitude"));
                    vendor.put("longitude", rs.getDouble("longitude"));
                    vendor.put("neighborhood", rs.getString("neighborhood"));
                    vendor.put("rating", rs.getDouble("rating"));
                    vendor.put("description", rs.getString("description"));
                    vendor.put("created_at", rs.getString("created_at"));
                    vendors.add(vendor);
                }
                return gson.toJson(vendors);
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Get vendor by ID
        get("/api/vendors/:id", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM vendors WHERE id = ?")) {
                
                pstmt.setInt(1, Integer.parseInt(req.params(":id")));
                ResultSet rs = pstmt.executeQuery();
                
                if (rs.next()) {
                    Map<String, Object> vendor = new HashMap<>();
                    vendor.put("id", rs.getInt("id"));
                    vendor.put("name", rs.getString("name"));
                    vendor.put("latitude", rs.getDouble("latitude"));
                    vendor.put("longitude", rs.getDouble("longitude"));
                    vendor.put("neighborhood", rs.getString("neighborhood"));
                    vendor.put("rating", rs.getDouble("rating"));
                    vendor.put("description", rs.getString("description"));
                    vendor.put("created_at", rs.getString("created_at"));
                    return gson.toJson(vendor);
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Vendor not found"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Create new vendor
        post("/api/vendors", (req, res) -> {
            try {
                Map<String, Object> vendor = gson.fromJson(req.body(), Map.class);
                
                try (Connection conn = DatabaseHelper.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(
                         "INSERT INTO vendors (name, latitude, longitude, neighborhood, rating, description) " +
                         "VALUES (?, ?, ?, ?, ?, ?)")) {
                    
                    pstmt.setString(1, (String) vendor.get("name"));
                    pstmt.setDouble(2, ((Number) vendor.get("latitude")).doubleValue());
                    pstmt.setDouble(3, ((Number) vendor.get("longitude")).doubleValue());
                    pstmt.setString(4, (String) vendor.get("neighborhood"));
                    pstmt.setDouble(5, ((Number) vendor.get("rating")).doubleValue());
                    pstmt.setString(6, (String) vendor.get("description"));
                    
                    pstmt.executeUpdate();
                    
                    try (ResultSet rs = pstmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            vendor.put("id", rs.getInt(1));
                            return gson.toJson(vendor);
                        }
                    }
                }
                res.status(500);
                return gson.toJson(Map.of("error", "Failed to create vendor"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Update vendor
        put("/api/vendors/:id", (req, res) -> {
            try {
                Map<String, Object> vendor = gson.fromJson(req.body(), Map.class);
                
                try (Connection conn = DatabaseHelper.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(
                         "UPDATE vendors SET name = ?, latitude = ?, longitude = ?, " +
                         "neighborhood = ?, rating = ?, description = ? WHERE id = ?")) {
                    
                    pstmt.setString(1, (String) vendor.get("name"));
                    pstmt.setDouble(2, ((Number) vendor.get("latitude")).doubleValue());
                    pstmt.setDouble(3, ((Number) vendor.get("longitude")).doubleValue());
                    pstmt.setString(4, (String) vendor.get("neighborhood"));
                    pstmt.setDouble(5, ((Number) vendor.get("rating")).doubleValue());
                    pstmt.setString(6, (String) vendor.get("description"));
                    pstmt.setInt(7, Integer.parseInt(req.params(":id")));
                    
                    int updated = pstmt.executeUpdate();
                    if (updated > 0) {
                        vendor.put("id", Integer.parseInt(req.params(":id")));
                        return gson.toJson(vendor);
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Vendor not found"));
                    }
                }
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Delete vendor
        delete("/api/vendors/:id", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement("DELETE FROM vendors WHERE id = ?")) {
                
                pstmt.setInt(1, Integer.parseInt(req.params(":id")));
                int deleted = pstmt.executeUpdate();
                
                if (deleted > 0) {
                    return gson.toJson(Map.of("message", "Vendor deleted successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Vendor not found"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
    }
}
