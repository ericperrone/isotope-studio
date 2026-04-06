package it.cnr.igg.isotopedb.conf;

import java.io.InputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class Conf {
	public static Properties readProperties() throws IOException {
		String confFile = "/etc/isotope/conf.properties";
		try (InputStream input = new FileInputStream(confFile)) {
			Properties prop = new Properties();
			prop.load(input);
			return prop;
		} catch (IOException ex) {
//			ex.printStackTrace();
//			throw ex;
			return loadDefault();
		}
	}
	
	public static Properties loadDefault() {
		Properties prop = new Properties();
		prop.setProperty("driver", "org.postgresql.Driver");
		prop.setProperty("url", "jdbc:postgresql://192.168.0.5:5432/itineris_wp8");
		prop.setProperty("user", "itineris_wp8_user");
		prop.setProperty("password", "9a1451ce4b899fac7f5f");
		prop.setProperty("db", "itineris_wp8");
		return prop;
	}
}