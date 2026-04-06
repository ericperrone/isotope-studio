The 'Isotope Studio' source code is organized into four Git repositories, available at the following URLs:

[1] https://github.com/ericperrone/isotopedb (backend: database management)

[2] https://github.com/ericperrone/sheetx  (backend: toolset for management of e-sheets) 

[3] https://github.com/ericperrone/isotopews (backend: REST API)

[4] https://github.com/ericperrone/isoapp (frontend)


The first three repositories contain the application backend, while the last one is for the frontend. To build the application, the backend and frontend must be built separately.

Prerequisites (Backend):
- JRE: Java SE Runtime Environment (v11 compatible)
- Build Tool: Maven 3.9.*

Backend build instructions: 
Clone the three backend-related repositories. Run the 'mvn install' command sequentially on isotopedb, sheetx, and isotopews.
Finally, the 'target' sub-folder of isotopews will contain the backend WAR file.

Prerequisites (Frontend)
- Angular CLI: 14.2.13
- Package Manager: npm 11.7.0 

Frontend build instructions:
Clone the isoapp repository, run npm install (first-time only), then ng build --base-href="./". 
Upon completion, the 'dist' sub-folder will contain the frontend code, appropriately minified and obfuscated.

The frontend and backend can reside on different servers, provided they are accessible via HTTP.
