package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisAuthorsDb extends ItinerisCommon {	
	public ItinerisAuthorsDb(String key) {
		super(key);
	}
	
	public ArrayList<AuthorBean> getItinerisAuthors() throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		String query = "select * from authors";
		PreparedStatement ps = null;
		try {
			con = checkItinerisKey();
			ArrayList<AuthorBean> authors = new ArrayList<AuthorBean>();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				authors.add(
						new AuthorBean(rs.getLong("id"), rs.getString("name"), rs.getString("surname"))
						);
			}
			return authors;
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
