package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class AuthorQuery extends Query {

	public AuthorQuery() {
		super();
	}

	public AuthorBean insert(AuthorBean bean, Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		String insertAuthor = "insert into authors (name, surname) values(?, ?)";
		String getId = "SELECT currval(pg_get_serial_sequence(\'authors\',\'id\')) as id";
		try {
			ps = con.prepareStatement(insertAuthor);
			ps.setString(1, "" + bean.getName());
			ps.setString(2, "" + bean.getSurname());
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

	public AuthorBean insert(AuthorBean bean) throws Exception, DbException {
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

	public AuthorBean getAuthor(String surname, String name, Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			String select = "select * from authors where lower(surname) = ? and lower(name) = ?";
			ps = con.prepareStatement(select);
			ps.setString(1, surname.toLowerCase());
			ps.setString(2, name.toLowerCase());
			rs = ps.executeQuery();
			AuthorBean bean = new AuthorBean(-1L, "null", "null");
			if (rs.next()) {
				bean.setId(rs.getLong("id"));
				bean.setSurname(rs.getString("surname"));
				bean.setName(rs.getString("name"));
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
	
	public AuthorBean getAuthor(String surname, String name) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getAuthor(surname, name, con);
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

	public ArrayList<AuthorBean> getAuthors(AuthorBean filter) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		Connection con = null;
		try {
			ArrayList<AuthorBean> beans = new ArrayList<AuthorBean>();
			String select = "select * from authors where 1=1";
			if (filter != null) {
				if (filter.getSurname() != null) {
					select += " and lower(surname) like ?";
				}
				if (filter.getName() != null) {
					select += " and lower(name) like ?";
				}
			}
			select += " order by surname, name";
			con = cm.createConnection();
			ps = con.prepareStatement(select);
			if (filter != null) {
				int position = 1;
				if (filter.getSurname() != null) {
					ps.setString(position, "%" + filter.getSurname().toLowerCase() + "%");
					position++;
				}
				if (filter.getName() != null) {
					ps.setString(position, "%" + filter.getName().toLowerCase() + "%");
				}
			}

			rs = ps.executeQuery();
			while (rs.next()) {
				beans.add(new AuthorBean(rs.getLong("id"), rs.getString("name"), rs.getString("surname")));
			}
			return beans;
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
			if (con != null) {
				con.setAutoCommit(true);
				cm.closeConnection();
			}
		}
	}

}
