package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisSamplesByAuthorDb extends ItinerisCommon {

	public ItinerisSamplesByAuthorDb(String key) {
		super(key);
	}

	public ArrayList<Integer> getSamples(Long authorId) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select si.sample_id from sample_index si "
				+ "where si.dataset_id in ("
				+ "select d.id from dataset d where d.id in (select da.dataset_id from dataset_authors da where da.author_id = ?))";
				
		ArrayList<Integer> ids = new ArrayList<Integer>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setInt(1, authorId.intValue());
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
