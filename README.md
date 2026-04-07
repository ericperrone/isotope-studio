# General Information and Repository Structure

The source code for 'Isotope Studio' is organized into two distinct components: the backend (built with Java) and the application frontend (built with Angular). The source code is structured into the following directories:

[1] isotopedb (backend: database management)

[2] sheetx  (backend: toolset for management of e-sheets) 

[3] isotopews (backend: REST API)

[4] isoapp (frontend)

In addition to these directories, a 'database' folder is also provided, containing the PostgreSQL database dump required by the application.

# Software Requirements

### Backend

- JRE: Java SE Runtime Environment (v11 compatible)
- Build Tool: Maven 3.9.*

### Frontend

- Angular CLI: 14.2.13
- Package Manager: npm 11.7.0 

### Database

- PstgreSQL 17 or higher

### Webserver

- Apache Tomcat 8.5 or higher

# Build instructions

To build the application after cloning the repository, please follow the instructions below:

### Backend

Each of the three folders making up the backend is equipped with its own pom.xml file. Navigate into each folder and run mvn install. This operation must be performed in the following order: first isotopedb and sheetx, and finally isotopews.
Finally, the 'target' sub-folder of isotopews will contain the backend WAR file.

### Frontend

Navigate into the 'isoapp' folder and run npm install (first-time only), then ng build --base-href="./". 
Upon completion, the 'dist' sub-folder will contain the frontend code, appropriately minified and obfuscated.


