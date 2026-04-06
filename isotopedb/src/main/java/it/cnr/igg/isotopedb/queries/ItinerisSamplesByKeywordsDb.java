package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisSamplesByKeywordsDb extends ItinerisCommon {
	public ItinerisSamplesByKeywordsDb(String key) {
		super(key);
	}
	
	public ArrayList<Integer> getSamples(String keywords) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		keywords = keywords.toLowerCase();
		String query = "select si.sample_id from sample_index si "
				+ "where si.dataset_id in (select d.id from dataset d where position(? in lower(d.metadata)) > 0 or position(? in lower(d.keywords)) > 0)";
		
		ArrayList<Integer> ids = new ArrayList<Integer>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setString(1, keywords);
			ps.setString(2, keywords);
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
