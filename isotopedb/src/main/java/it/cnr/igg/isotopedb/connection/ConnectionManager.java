package it.cnr.igg.isotopedb.connection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Properties;

import it.cnr.igg.isotopedb.conf.Conf;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class ConnectionManager {
	private Connection connection;

	public ConnectionManager() {
		// TODO Auto-generated constructor stub
	}

	public Connection createConnection() throws DbException {
		try {
			Class.forName("org.postgresql.Driver"); 
			Properties props = Conf.readProperties();
			connection = DriverManager.getConnection(props.getProperty("url"), props.getProperty("user"),
					props.getProperty("password"));
			return connection;
		} catch (Exception ex) {
			try {
				return loadDefault();
			} catch (Exception e) {
				e.printStackTrace();
				throw new DbException(e);
			}
//			ex.printStackTrace();
//			throw new DbException(ex);
		}
	}

	public void closeConnection() {
		if (connection != null) {
			try {
				connection.close();
			} catch (Exception ex) {
				ex.printStackTrace();
			}
		}
	}
	
	private Connection loadDefault() throws Exception {
		Class.forName("org.postgresql.Driver"); 
		Properties props = Conf.loadDefault();
		connection = DriverManager.getConnection(props.getProperty("url"), props.getProperty("user"),
				props.getProperty("password"));
		return connection;
	}

}
