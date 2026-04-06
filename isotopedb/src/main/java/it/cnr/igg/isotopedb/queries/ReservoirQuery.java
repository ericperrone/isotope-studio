package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.ReservoirBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class ReservoirQuery extends Query {

	public ReservoirQuery() {
		super();
	}
	
	public ArrayList<String> getRerservoirList() throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getReservoirList(con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null) {
				cm.closeConnection();
			}
		}
	}
	
	public ArrayList<String> getReservoirList(Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		ArrayList<String> list = new ArrayList<String>();
		try {
			String select = "select distinct reservoir from reservoir";
			ps = con.prepareStatement(select);
			rs = ps.executeQuery();
			while (rs.next()) {
				list.add(rs.getString("reservoir"));
			}
			return list;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (rs != null)
				rs.close();
			if (ps != null) 
				ps.close();
		}
	}


	public ArrayList<ReservoirBean> getReservoir(String filter) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getReservoir(filter, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null) {
				cm.closeConnection();
			}
		}
	}

	public ArrayList<ReservoirBean> getReservoir(String filter, Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		ArrayList<ReservoirBean> list = new ArrayList<ReservoirBean>();
		try {
			String select = "select * from reservoir";
			if (filter != null) {
				select += " where lower(reservoir) like ?";
			}
			ps = con.prepareStatement(select);
			if (filter != null) {
				ps.setString(1, "%" + filter.toLowerCase() + "%");
			}
			rs = ps.executeQuery();
			while (rs.next()) {
				list.add(new ReservoirBean(rs.getLong("id"), rs.getString("reservoir"), rs.getInt("z"),
						rs.getString("element"), rs.getDouble("value"), rs.getString("unit"), rs.getString("reference"),
						rs.getString("source"), rs.getString("doi"), rs.getString("error_type"),
						rs.getDouble("error")));
			}
			return list;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (rs != null)
				rs.close();
			if (ps != null) 
				ps.close();
		}
	}

	public ReservoirBean insert(ReservoirBean bean) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			con.setAutoCommit(false); // start transaction
			return insert(bean, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null) {
				con.setAutoCommit(true);
				cm.closeConnection();
			}
		}
	}

	public ReservoirBean insert(ReservoirBean bean, Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		String insertReservoir = "insert into reservoir (reservoir, element, value, unit, reference, source, doi, error, error_type) "
				+ "values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
		String getId = "SELECT currval(pg_get_serial_sequence(\'reservoir\',\'id\')) as id";
		try {
			ps = con.prepareStatement(insertReservoir);
			ps.setString(1, bean.getReservoir());
			ps.setString(2, bean.getElement());
			ps.setDouble(3, bean.getValue());
			ps.setString(4, bean.getUm());
			ps.setString(5, bean.getReference());
			ps.setString(6, bean.getSource());
			ps.setString(7, bean.getDoi());
			ps.setDouble(8, bean.getError());
			ps.setString(9, bean.getErrorType());
			ps.execute();
			ps.close();

			ps = con.prepareStatement(getId);
			rs = ps.executeQuery();
			if (rs.next()) {
				bean.setId(rs.getLong("id"));
			}
			return bean;
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
		}
	}

}
