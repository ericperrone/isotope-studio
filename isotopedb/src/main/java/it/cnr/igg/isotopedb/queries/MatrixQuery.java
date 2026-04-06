package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import it.cnr.igg.isotopedb.beans.MatrixAlias;
import it.cnr.igg.isotopedb.beans.MatrixBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class MatrixQuery extends Query {

	private String baseQuery = "select m.matrix, m.nodeid, m.parent_nodeid from matrix m where 1=1 ";
	private String baseOrderBy = "order by m.nodeid";

	public MatrixQuery() {
		super();
	}

	public ArrayList<MatrixBean> getAll() throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getAll(con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getRoots() throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getRoots(con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getRoots(Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(baseQuery + " and parent_nodeid is null " + baseOrderBy);
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public ArrayList<MatrixBean> getChildren(Integer nodeId) throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getChildren(con, nodeId);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getChildren(Connection con, Integer nodeId) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		String query = baseQuery + " and parent_nodeid = ? order by nodeid";

		try {
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(query);
			ps.setInt(1, nodeId);
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public MatrixBean getNode(Integer nodeId) throws DbException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		MatrixBean bean = null;

		try {
			con = cm.createConnection();
			ps = con.prepareStatement(baseQuery + " and nodeid = ?");
			ps.setInt(1, nodeId);
			rs = ps.executeQuery();

			if (rs.next()) {
				bean = new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix"));
			}
			return bean;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
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

	public ArrayList<MatrixBean> getAncestor(Integer nodeId) throws DbException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ResultSet rs = null;
		ArrayList<MatrixBean> beans = new ArrayList<MatrixBean>();

		try {
			con = cm.createConnection();
			ps = con.prepareStatement("select parent_nodeid from matrix where nodeid = ?");
			ps.setInt(1, nodeId);
			rs = ps.executeQuery();

			if (rs.next()) {
				Integer parent = rs.getInt(1);
				if (parent != null) {
					return getChildren(con, parent);
				}
			}

			return beans;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
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

	public ArrayList<MatrixBean> getTree(Integer nodeId) throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getTree(con, nodeId);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getTree(Connection con, Integer nodeId) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		String query = baseQuery + " and nodeid between ? and ? order by nodeid";

		try {
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(query);
			Integer limit = nodeId - 1 + 10000;
			ps.setInt(1, nodeId);
			ps.setInt(2, limit);
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public ArrayList<Integer> getSubTree(Connection con, Integer nodeId) throws Exception, DbException {
		ArrayList<Integer> subTree = new ArrayList<Integer>();
		getSubTreeRc(con, subTree, nodeId);
		return subTree;
	}

	public void getSubTreeRc(Connection con, ArrayList<Integer> subTree, Integer nodeId) throws Exception, DbException {
		subTree.add(nodeId);
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			ps = con.prepareStatement("select nodeid from matrix where parent_nodeid = ?");
			ps.setInt(1, nodeId);
			rs = ps.executeQuery();
			while (rs.next()) {
				getSubTreeRc(con, subTree, rs.getInt(1));
			}
		} catch (Exception x) {
			x.printStackTrace();
			throw new DbException(x.getMessage());
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null)
				ps.close();
		}
	}

	public ArrayList<MatrixBean> getAll(Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(baseQuery + baseOrderBy);
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public ArrayList<MatrixBean> getByName(String name) throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getByName(con, name);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getByName(Connection con, String name) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			String query = baseQuery + " and lower(matrix) = ? " + baseOrderBy;
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(query);
			ps.setString(1, name.toLowerCase());
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			if (m.size() == 0)
				m = getByAlias(con, name);
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public ArrayList<MatrixBean> getByAlias(String alias) throws DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getByAlias(con, alias);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<MatrixBean> getByAlias(Connection con, String alias) throws Exception, DbException {
		String query = "select m.nodeid , m.matrix, m.parent_nodeid from matrix m where m.nodeid = (select ma.matrix_id from matrix_aliases ma where ma.alias = ?)";
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ArrayList<MatrixBean> m = new ArrayList<MatrixBean>();
			ps = con.prepareStatement(query);
			ps.setString(1, alias);
			rs = ps.executeQuery();
			while (rs.next()) {
				m.add(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix")));
			}
			return m;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public MatrixBean getMatrixByName(Connection con, String name) throws Exception, DbException {
		String query = "select * from matrix where lower(matrix) = ?";
		PreparedStatement ps = null;
		ResultSet rs = null;

		try {
			ps = con.prepareStatement(query);
			ps.setString(1, name);
			rs = ps.executeQuery();
			if (rs.next()) {
				return new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), rs.getString("matrix"));
			}
			return null;
		} catch (Exception ex) {
			throw ex;
		} finally {
			if (rs != null) {
				rs.close();
			}
			if (ps != null) {
				ps.close();
			}
		}
	}

	public void insertSampleMatrix(Long sampleId, ArrayList<MatrixBean> beans) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			insertSampleMatrix(con, sampleId, beans);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			cm.closeConnection();
		}
	}

	public void insertSampleMatrix(Connection con, Long sampleId, ArrayList<MatrixBean> beans)
			throws Exception, DbException {
		String insert = "insert into sample_matrix (sample_id, matrix_id) values (?, ?)";
		PreparedStatement ps = null;
		try {
			for (MatrixBean mb : beans) {
				ps = con.prepareStatement(insert);
				ps.setLong(1, sampleId);
				ps.setLong(2, mb.getNodeId());
				ps.execute();
				ps.close();
				ps = null;
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			if (ps != null) {
				ps.close();
			}
		}
	}

	public void insertSampleMatrix(Connection con, Long sampleId, Long matrixId) throws Exception, DbException {
		String insert = "insert into sample_matrix (sample_id, matrix_id) values (?, ?)";
		PreparedStatement ps = null;
		try 
		{
				ps = con.prepareStatement(insert);
				ps.setLong(1, sampleId);
				ps.setLong(2, matrixId);
				ps.execute();
				ps.close();
				ps = null;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex.getMessage());
		} finally {
			if (ps != null) {
				ps.close();
			}
		}
	}
}
