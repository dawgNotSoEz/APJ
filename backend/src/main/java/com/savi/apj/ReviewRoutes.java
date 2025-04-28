package com.savi.apj;

import com.google.gson.Gson;
import spark.Route;
import static spark.Spark.*;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ReviewRoutes {
    private final Gson gson = new Gson();
    
    public void init() {
        // Get all reviews for a vendor
        get("/api/vendors/:vendorId/reviews", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement(
                     "SELECT * FROM reviews WHERE vendor_id = ? ORDER BY created_at DESC")) {
                
                pstmt.setInt(1, Integer.parseInt(req.params(":vendorId")));
                ResultSet rs = pstmt.executeQuery();
                
                ArrayList<Map<String, Object>> reviews = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> review = new HashMap<>();
                    review.put("id", rs.getInt("id"));
                    review.put("vendor_id", rs.getInt("vendor_id"));
                    review.put("rating", rs.getInt("rating"));
                    review.put("comment", rs.getString("comment"));
                    review.put("created_at", rs.getString("created_at"));
                    reviews.add(review);
                }
                return gson.toJson(reviews);
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Get review by ID
        get("/api/reviews/:id", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement("SELECT * FROM reviews WHERE id = ?")) {
                
                pstmt.setInt(1, Integer.parseInt(req.params(":id")));
                ResultSet rs = pstmt.executeQuery();
                
                if (rs.next()) {
                    Map<String, Object> review = new HashMap<>();
                    review.put("id", rs.getInt("id"));
                    review.put("vendor_id", rs.getInt("vendor_id"));
                    review.put("rating", rs.getInt("rating"));
                    review.put("comment", rs.getString("comment"));
                    review.put("created_at", rs.getString("created_at"));
                    return gson.toJson(review);
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Review not found"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Create new review
        post("/api/vendors/:vendorId/reviews", (req, res) -> {
            try {
                Map<String, Object> review = gson.fromJson(req.body(), Map.class);
                int vendorId = Integer.parseInt(req.params(":vendorId"));
                
                try (Connection conn = DatabaseHelper.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(
                         "INSERT INTO reviews (vendor_id, rating, comment) VALUES (?, ?, ?)")) {
                    
                    pstmt.setInt(1, vendorId);
                    pstmt.setInt(2, ((Number) review.get("rating")).intValue());
                    pstmt.setString(3, (String) review.get("comment"));
                    
                    pstmt.executeUpdate();
                    
                    try (ResultSet rs = pstmt.getGeneratedKeys()) {
                        if (rs.next()) {
                            review.put("id", rs.getInt(1));
                            review.put("vendor_id", vendorId);
                            return gson.toJson(review);
                        }
                    }
                }
                res.status(500);
                return gson.toJson(Map.of("error", "Failed to create review"));
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Update review
        put("/api/reviews/:id", (req, res) -> {
            try {
                Map<String, Object> review = gson.fromJson(req.body(), Map.class);
                
                try (Connection conn = DatabaseHelper.getConnection();
                     PreparedStatement pstmt = conn.prepareStatement(
                         "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?")) {
                    
                    pstmt.setInt(1, ((Number) review.get("rating")).intValue());
                    pstmt.setString(2, (String) review.get("comment"));
                    pstmt.setInt(3, Integer.parseInt(req.params(":id")));
                    
                    int updated = pstmt.executeUpdate();
                    if (updated > 0) {
                        review.put("id", Integer.parseInt(req.params(":id")));
                        return gson.toJson(review);
                    } else {
                        res.status(404);
                        return gson.toJson(Map.of("error", "Review not found"));
                    }
                }
            } catch (Exception e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
        
        // Delete review
        delete("/api/reviews/:id", (req, res) -> {
            try (Connection conn = DatabaseHelper.getConnection();
                 PreparedStatement pstmt = conn.prepareStatement("DELETE FROM reviews WHERE id = ?")) {
                
                pstmt.setInt(1, Integer.parseInt(req.params(":id")));
                int deleted = pstmt.executeUpdate();
                
                if (deleted > 0) {
                    return gson.toJson(Map.of("message", "Review deleted successfully"));
                } else {
                    res.status(404);
                    return gson.toJson(Map.of("error", "Review not found"));
                }
            } catch (SQLException e) {
                res.status(500);
                return gson.toJson(Map.of("error", e.getMessage()));
            }
        });
    }
}
