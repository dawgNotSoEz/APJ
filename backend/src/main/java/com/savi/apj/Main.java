package com.savi.apj;

import spark.Spark;
import com.google.gson.Gson;
import static spark.Spark.*;

public class Main {
    private static final Gson gson = new Gson();
    
    public static void main(String[] args) {
        // Set port
        port(4567);
        
        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            response.type("application/json");
        });

        // Initialize routes
        new VendorRoutes().init();
        new ReviewRoutes().init();
        
        // Health check endpoint
        get("/health", (req, res) -> {
            return gson.toJson(new HealthResponse("OK"));
        });
    }
    
    private static class HealthResponse {
        private String status;
        
        public HealthResponse(String status) {
            this.status = status;
        }
    }
}
