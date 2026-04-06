package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.exceptions.DbException;

public class KeywordsQuery extends Query {

	public KeywordsQuery() {
		super();
	}

	public ArrayList<String> getKeywords() throws DbException, Exception {
		Connection con = null;
		
		try {
			con = cm.createConnection();
			return getKeywords(con);
		} catch (Exception x) {
			x.printStackTrace();
			throw new DbException(x);
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<String> getKeywords(Connection con) throws DbException, Exception {
		PreparedStatement ps = null;
		ResultSet rs = null;
		
		try {
			ps = con.prepareStatement("select key from keywords");
			rs = ps.executeQuery();
			ArrayList<String> keywords = new ArrayList<String>();

			while (rs.next()) {
				keywords.add(rs.getString("key"));
			}
			return keywords;
		} catch (Exception x) {
			x.printStackTrace();
			throw new DbException(x);
		} finally {
			if (ps != null) {
				ps.close();
			}
		}
	}

}
