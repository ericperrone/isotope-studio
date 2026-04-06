package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisCommon extends Query {
	private String key = null;
	
	public ItinerisCommon() {
		super();
	}
	
	public ItinerisCommon(String key) {
		super();
		this.key = key;
	}
	
	public void checkItinerisKey(String key) throws DbException, NotAuthorizedException, Exception  {
		Connection con = null;
		try {
			this.key = key;
			con = cm.createConnection();
			if (checkItinerisKey(con) == false)
				throw new NotAuthorizedException();
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null)
				con.close();
		}
	}
	
	public Connection checkItinerisKey() throws DbException, NotAuthorizedException  {
		Connection con = null;
		try {
			con = cm.createConnection();
			if (checkItinerisKey(con) == false)
				throw new NotAuthorizedException();
			return con;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} 
	}

	public boolean checkItinerisKey(Connection con) throws Exception {
		PreparedStatement ps = null;
		try {			
			ps = con.prepareStatement("select * from itineris_keys where itineris_key = ? and expiration_time is null");
			ps.setString(1, key);
			ResultSet rs = ps.executeQuery();
			return rs.next();
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (ps != null) {
				ps.close();
			}
		}
	}


}
