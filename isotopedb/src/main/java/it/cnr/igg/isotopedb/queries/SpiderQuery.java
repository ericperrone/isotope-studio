package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import it.cnr.igg.isotopedb.beans.SpiderBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class SpiderQuery extends Query {

	public SpiderQuery() {
		super();
	}
	
	public ArrayList<SpiderBean> getNorms() throws Exception, DbException {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		ArrayList<SpiderBean> norms = new ArrayList<SpiderBean>();
		String query = "select * from spider_normalization";
		
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			rs = ps.executeQuery();
			while (rs.next()) {
				norms.add(new SpiderBean(rs.getString("method"), rs.getString("norm"), rs.getString("ord")));
			}
			return norms;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (rs != null)
				rs.close();
			if (ps != null)
				ps.close();
			cm.closeConnection();
		}
	}
}
