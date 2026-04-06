package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisSampleByReferenceDb extends ItinerisCommon {

	public ItinerisSampleByReferenceDb(String key) {
		super(key);
	}

	public ArrayList<Integer> getSamples(String reference) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select distinct si.sample_id from sample_index si "
				+ "where si.dataset_id = (select id from dataset where link=?)";
		ArrayList<Integer> ids = new ArrayList<Integer>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setString(1, reference);
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
