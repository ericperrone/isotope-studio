package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;
import it.cnr.igg.isotopedb.beans.GeoAreaBean;

public class ItinerisSamplesByAreaDb extends ItinerisCommon {
	
	public ItinerisSamplesByAreaDb(String key) {
		super(key);
	}
	
	public ArrayList<Integer> getSamples(GeoAreaBean area) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select distinct si.sample_id from sample_index si, sample_attribute sa  "
				+ "left join coord c on c.sample_id = sa.sample_id "
				+ "where sa.sample_id = si.sample_id "
				+ "and c.latitude >= ? and c.latitude <= ? "
				+ "and c.longitude >= ? and c.longitude <= ?";
				
		ArrayList<Integer> ids = new ArrayList<Integer>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setFloat(1, area.getBottomLat());
			ps.setFloat(2, area.getTopLat());
			ps.setFloat(3, area.getBottomLon());
			ps.setFloat(4, area.getTopLon());
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				ids.add(rs.getInt("sample_id"));
			}
			return ids;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (ps != null) {
				ps.close();
			}
			if (con != null) {
				cm.closeConnection();
			}
		}
	}	

}
