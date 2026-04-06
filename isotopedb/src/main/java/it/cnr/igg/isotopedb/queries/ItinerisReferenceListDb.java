package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.DatasetBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisReferenceListDb extends ItinerisCommon {

	public ItinerisReferenceListDb(String key) {
		super(key);
	}
	
	public ArrayList<DatasetBean> getReferenceList() throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select d.link, d.metadata from dataset d";

		ArrayList<DatasetBean> data = new ArrayList<DatasetBean>();
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				DatasetBean bean = new DatasetBean();
				bean.setLink(rs.getString("link"));
				bean.setMetadata(rs.getString("metadata"));
				data.add(bean);
			}
			return data;
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
