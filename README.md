# General Information and Repository Structure

The source code for 'Isotope Studio' is organized into two distinct components: the backend (built with Java) and the application frontend (built with Angular). The source code is structured into the following directories:

[1] isotopedb (backend: database management)

[2] sheetx  (backend: toolset for management of e-sheets) 

[3] isotopews (backend: REST API)

[4] isoapp (frontend)

In addition to these directories, a 'database' folder is also provided, containing a minimal version of the PostgreSQL database dump required by the application.

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
Upon completion, the 'dist/isoapp' sub-folder will contain the frontend code, appropriately minified and obfuscated.


# Deployment and Configuration Instructions

Copy the .war file and the 'isoapp' (path isotopews/target) folder (path: isoapp/dist/isoapp) into the Tomcat webapps folder.

Create a new database with PosgtreSQL and import (pg_restore) the provided database dump. 

Create the directory /etc/isotope and copy the conf.properties file (located at database/isotope) into it. Edit conf.properties to properly configure the database access.


If you wish to explore the application without the burden of building the code yourself, you can use a public Docker image, which is freely available on Docker Hub via the following command: docker pull perroneeric/isotopestudio:latest.

Once you have obtained the Docker image, you will still need to install the database (using the dump provided in this repository) and make it available to the application by properly configuring the /etc/isotope/conf.properties file inside the container. For testing and demonstration purposes, you can use the username/password 'admin / admin2026' to import new datasets for research and data processing.




