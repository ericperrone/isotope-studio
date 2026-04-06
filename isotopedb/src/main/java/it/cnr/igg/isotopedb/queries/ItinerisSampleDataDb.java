package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.SampleDataBean;
import it.cnr.igg.isotopedb.beans.FullSampleDataBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NotAuthorizedException;

public class ItinerisSampleDataDb extends ItinerisCommon {

	public ItinerisSampleDataDb(String key) {
		super(key);
	}
	
	public FullSampleDataBean getSampleData(Integer sampleId) throws DbException, NotAuthorizedException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		String query = "select sa.type, sa.name, sa.svalue, sa.nvalue, um, s.name as synonym from sample_attribute sa "
				+ "left join synonyms s on s.synonym = regexp_replace(sa.name, ' \\\\[.*\\\\]', '') "
				+ "where sa.sample_id = ?";
		String query2 = "select d.metadata from dataset d where d.id = (select dataset_id from sample_index where sample_id = ?)";
		ArrayList<SampleDataBean> list = new ArrayList<SampleDataBean>();
		String metadata = ""; 
		try {
			con = checkItinerisKey();
			ps = con.prepareStatement(query);
			ps.setInt(1, sampleId);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				SampleDataBean sdb = new SampleDataBean(rs.getString("type"),
						rs.getString("name"),
						rs.getString("svalue"),
						rs.getFloat("nvalue"),
						rs.getString("um"),
						rs.getString("synonym")
						);
				list.add(sdb);
			}
			rs.close();
			ps.close();
			ps = con.prepareStatement(query2);
			ps.setInt(1, sampleId);
			rs = ps.executeQuery();
			if (rs.next()) {
				metadata = rs.getString("metadata");
			}
			return new FullSampleDataBean(list, metadata);
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
