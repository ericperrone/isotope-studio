package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisMetadataByAuthorDb extends ItinerisCommon {

	public ItinerisMetadataByAuthorDb(String key) {
		super(key);
	}
	
	public ArrayList<String> getMetadata(Long authorId) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select d.metadata from dataset d "
				+ "where d.metadata is not null "
				+ "and d.id in (select da.dataset_id from dataset_authors da where da.author_id = ?)";
		ArrayList<String> metadata = new ArrayList<String>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setInt(1, authorId.intValue());
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				metadata.add(rs.getString("metadata"));
			}
			return metadata;
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
