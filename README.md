# ISOTOPE STUDIO
Code for the manuscript: "ISOTOPE STUDIO: Advanced Modelling and Management of Environmental Isotope Data in Open Science Ecosystems (ITINERIS project)" 
submitted to Computers and Geosciences.

### Manuscript information
Title: "ISOTOPE STUDIO: Advanced Modelling and Management of Environmental Isotope Data in Open Science Ecosystems (ITINERIS project)" 

Authors: Di Giuseppe, P., Gennaro, S., Perrone, E., Procaccini, M., Agostini, S., Provenzale, A., Trumpy, E. 

Status: Submitted to Computers and Geosciences 

Code DOI: not yet available. DOI will be assigned upon acceptance

![Java](https://img.shields.io/badge/Java-11-blue) ![Angular](https://img.shields.io/badge/Angular-14-red) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17+-blue) ![Docker](https://img.shields.io/badge/Docker-Available-green)

# General Information and Repository Structure
Isotope Studio is a web-based application developed to be integrated into the ITINERIS Isotope Virtual Research Environment (ISOTOPE VRE) - provided by D4Science (Assante et al., 2019) - to gather geochemical and isotopic data, and to provide tools for data analysis and interpretation.

**Reference:**
> M. Assante et al. (2019) Enacting open science by D4Science. Future Gener. Comput. Syst. 101: 555-563. DOI: [10.1016/j.future.2019.05.063](https://doi.org/10.1016/j.future.2019.05.063)

As described in the manuscript, the architecture of 'Isotope Studio' is organized into 3 distinct layers:
1. **Presentation Layer (Frontend)**: built with Angular.
2. **Service Layer (Middleware)**: built with Java.
3. **Data Layer (Backend)**: powered by PostgreSQL.

The source code in this repository covers the Frontend and Middleware layers, and is structured into the following directories:

| Directory | Layer | Description |
| :--- | :--- | :--- |
| `isotopedb` | Middleware | Database management |
| `sheetx` | Middleware | Toolset for e-sheet management |
| `isotopews` | Middleware | REST middleware services |
| `isoapp` | Frontend | Angular application |

In addition to these directories, a 'database' folder is also provided, containing a minimal version of the PostgreSQL database dump required by the Data Layer.

## Very Quick Start (VRE)
The fastest way to experience Isotope Studio is to access it directly through the ITINERIS Isotope Virtual Research Environment (ISOTOPE VRE) provided by D4Science, without requiring any local installation or setup.

## Quick Start (Docker)
If you wish to explore the application locally without compiling the code, you can use a public Docker image, which is freely available on Docker Hub by using the following commands: 
1. Pull the image: docker pull perroneeric/isotopestudio:latest.
2. Follow the [Configuration](#deployment-and-configuration-instructions) steps to link your database.

In particular, once you have obtained the Docker image, you will still need to install the database (using the dump provided in this repository) and make it available to the application by properly configuring the /etc/isotope/conf.properties file inside the container. 

3. For testing and demonstration purposes, login with: **admin / admin2026** to import new datasets for research and data processing. 

# Build instructions

To build the application after cloning the repository, please ensure you meet the following software requirements.

### Software Requirements

**Middleware**
- JRE: Java SE Runtime Environment (v11 compatible)
- Build Tool: Maven 3.9.*

**Frontend**
- Angular CLI: 14.2.13
- Package Manager: npm 11.7.0 

**Database**
- PostgreSQL 17 or higher

**Webserver**
- Apache Tomcat 8.5 or higher

### Middleware Build

Each of the three folders making up the middleware is equipped with its own pom.xml file. Navigate into each folder and run mvn install. This operation must be performed in the following order: first isotopedb and sheetx, and finally isotopews.
Finally, the 'target' sub-folder of isotopews will contain the middleware WAR file.

See the following code to navigate into each folder and run: 

```bash 

cd isotopedb && mvn install

cd ../sheetx && mvn install

cd ../isotopews && mvn install

```

The artifact will be located in `isotopews/target/isotopews.war`.

### Frontend Build

Navigate into the 'isoapp' folder and run npm install (first-time only), then ng build --base-href="./". 
Upon completion, the 'dist/isoapp' sub-folder will contain the frontend code, appropriately minified and obfuscated. 

```bash

cd isoapp

npm install

ng build --base-href="./"

```

# Deployment and Configuration Instructions

Copy the .war file (path isotopews/target) and the 'isoapp'  folder (path: isoapp/dist/isoapp) into the Tomcat webapps folder.

Create a new UTF-8 database with PosgtreSQL and import (pg_restore) the provided database dump:

pg_restore -d your_db_name database/minimal_dump.sql. 

Create the directory /etc/isotope and copy the conf.properties file (located at database/isotope) into it. Edit conf.properties to properly configure the database access.




