package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;
import java.util.ArrayList;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.beans.CountryBean;

public class CountryQuery extends Query {

	public CountryBean getById(Long id) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			Connection con = cm.createConnection();
			String select = "SELECT * FROM countries WHERE id = ?";

			ps = con.prepareStatement(select);
			ps.setLong(1, id);

			rs = ps.executeQuery();

			rs.next();
			CountryBean c = new CountryBean(rs.getLong("id"), rs.getString("country_code"), rs.getString("country_name"),
					rs.getString("old_name"));

			return c;

		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
			cm.closeConnection();
		}
	}

	public List<CountryBean> getByName(String name) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			Connection con = cm.createConnection();
			String select = "SELECT * FROM countries WHERE LOWER(country_name) LIKE ? OR LOWER(old_name) LIKE ?";

			ps = con.prepareStatement(select);
			ps.setString(1, name.toLowerCase() + "%");
			ps.setString(2, name.toUpperCase() + "%");

			rs = ps.executeQuery();

			List<CountryBean> results = new ArrayList<CountryBean>();
			while (rs.next()) {
				CountryBean c = new CountryBean(rs.getLong("id"), rs.getString("country_code"), rs.getString("country_name"),
						rs.getString("old_name"));
				results.add(c);
			}

			return results;

		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
			cm.closeConnection();
		}
	}
}
