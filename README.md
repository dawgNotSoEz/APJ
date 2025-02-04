# Apna Pakwan Junction (APJ) - Delhi Street Food Finder

## Overview
APJ (Apna Pakwan Junction) is a web application for discovering authentic street food vendors in Delhi. Built with a Java backend and HTML/CSS/JS frontend, the application provides real-time vendor search and an interactive map interface.

## Technology Stack
### Backend
- **Java 17**
  - Spring Boot framework
  - RESTful API implementation
  - JWT for authentication
  - Maven for dependency management

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript**
  - Vanilla JS for DOM manipulation
  - Leaflet.js for maps
  - AJAX for API calls

### Database
- **MySQL/PostgreSQL**
  - Vendor information
  - User data
  - Reviews and ratings
  - Location data

### External APIs
- OpenStreetMap for map tiles

## Project Structure
```
apj-streetfood/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/apj/
│   │   │       ├── controller/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       └── service/
│   │   ├── resources/
│   │   │   ├── application.properties
│   │   │   └── static/
│   │   └── webapp/
│   │       ├── WEB-INF/
│   │       ├── css/
│   │       ├── js/
│   │       └── index.html
│   └── test/
└── pom.xml
```

## Database Schema
```sql
-- Vendors Table
CREATE TABLE vendors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    neighborhood VARCHAR(100),
    rating DECIMAL(2,1),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Specialties Table
CREATE TABLE specialties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vendor_id INT,
    item_name VARCHAR(100),
    price DECIMAL(10,2),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Tags Table
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE
);

-- Vendor Tags Mapping
CREATE TABLE vendor_tags (
    vendor_id INT,
    tag_id INT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id),
    PRIMARY KEY (vendor_id, tag_id)
);
```

## Setup and Installation
1. Prerequisites:
   - JDK 17 or higher
   - Maven 3.6+
   - MySQL/PostgreSQL
   - Node.js (for development)

2. Database Setup:
```bash
mysql -u root -p
source database/init.sql
```

3. Backend Setup:
```bash
mvn clean install
mvn spring-boot:run
```

4. Frontend Setup:
```bash
# Navigate to webapp directory
cd src/main/webapp
# If using a development server
npm install
npm start
```

## API Endpoints
### Vendors
- GET `/api/vendors` - List all vendors
- GET `/api/vendors/{id}` - Get vendor details
- POST `/api/vendors` - Add new vendor
- PUT `/api/vendors/{id}` - Update vendor
- DELETE `/api/vendors/{id}` - Delete vendor

### Search
- GET `/api/search?q={query}` - Search vendors
- GET `/api/filter?tags={tags}` - Filter by tags

## Core Features
1. **Vendor Management**
   - CRUD operations for vendors
   - Location tracking
   - Specialty items management

2. **Search System**
   - Full-text search
   - Tag-based filtering
   - Location-based sorting

3. **Map Integration**
   - Interactive vendor markers
   - Area-based search
   - Distance calculation

## Development Guidelines
1. **Java Code Style**
   - Follow Google Java Style Guide
   - Use proper JavaDoc comments
   - Implement interface-based design

2. **Database**
   - Use prepared statements
   - Implement database indexing
   - Regular backup system

3. **Frontend**
   - Responsive design
   - Progressive enhancement
   - Cross-browser compatibility

## Security Implementation
- JWT based authentication
- Password hashing
- SQL injection prevention
- XSS protection
- CORS configuration

## Performance Optimizations
- Database indexing
- Connection pooling
- Caching implementation
- Lazy loading
- Image optimization

## Testing
```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=VendorServiceTest
```

## Deployment
1. Build JAR:
```bash
mvn package
```

2. Run Application:
```bash
java -jar target/apj-streetfood-1.0.jar
```

3. Database Migration:
```bash
mysql -u username -p database_name < migrations/latest.sql
```

## Monitoring
- Application logs in `/logs`
- Performance metrics via Spring Actuator
- Database query logging

## Troubleshooting
Common issues and solutions:
1. Database connection issues
   - Check application.properties
   - Verify database credentials

2. Server startup failures
   - Port conflicts
   - Missing dependencies

## Contributing
1. Fork repository
2. Create feature branch
3. Follow code style guidelines
4. Submit pull request

## License
MIT License

## Contact
- Technical Support: tech@apjfinder.com
- Business Inquiries: business@apjfinder.com