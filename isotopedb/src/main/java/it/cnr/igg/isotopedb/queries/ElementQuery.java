package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.ElementBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class ElementQuery extends Query {

	public ElementQuery() {
		super();
	}

	public void insert(ElementBean bean) throws Exception {
		Connection con = null;
		try {
			con = cm.createConnection();
			insertElement(bean, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null) {
				cm.closeConnection();
			}
		}
	}

	public void insertElement(ElementBean bean, Connection con) throws Exception {
		PreparedStatement ps = null;
		try {
			String insert = "insert into chem_elements ";
			if (bean.getGroup() != null) {
				insert += "(element, isotope, group) values (?, ?, ?)";
			} else {
				insert += "(element, isotope) values (?, ?)";
			}
			ps = con.prepareStatement(insert);
			ps.setString(1, bean.getElement());
			ps.setBoolean(2, bean.isIsotope());
			if (bean.getGroup() != null) {
				ps.setString(3, bean.getGroup());
			}
			ps.execute();

		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (ps != null) {
				ps.close();
			}
		}
	}

	public ElementBean getElementByName(String elementName) throws Exception {
		Connection con = null;

		try {
			con = cm.createConnection();
			return getElementByName(elementName, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			if (con != null) {
				cm.closeConnection();
			}
		}
	}

	public ElementBean getElementByName(String elementName, Connection con) throws Exception {
		PreparedStatement ps = null;
		ResultSet rs = null;
		ElementBean bean = null;

		try {
			String select = "select * from chem_elements where lower(element) = ?";
			ps = con.prepareStatement(select);
			ps.setString(1, elementName.toLowerCase());
			rs = ps.executeQuery();
			if (rs.next()) {
				bean = new ElementBean();
				bean.setElement(rs.getString("element"));
				bean.setIsotope(rs.getBoolean("isotope"));
				bean.setGroup(rs.getString("group"));
			}
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

		return bean;
	}

	public void testElements(ArrayList<ElementBean> beans, Connection con) throws Exception {
		try {
			for (ElementBean bean : beans) {
				ArrayList<String> ls = getElementsFromString(bean.getElement());
				for (String name : ls) {
					if (getElementByName(name, con) == null) {
						bean.setElement(name);
						insertElement(bean, con);
					}
				}
			}
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		}
	}

	public ArrayList<ElementBean> getAll() throws Exception {
		ArrayList<ElementBean> result = new ArrayList<ElementBean>();
		PreparedStatement ps = null;
		ResultSet rs = null;
		Connection con = null;

		try {
			String select = "select * from chem_elements";
			con = cm.createConnection();
			ps = con.prepareStatement(select);
			rs = ps.executeQuery();
			while (rs.next()) {
				ElementBean bean = new ElementBean(rs.getString("element"), rs.getBoolean("isotope"),
						rs.getString("group"));
				result.add(bean);
			}
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
				cm.closeConnection();
			}
		}
		return result;
	}

	public ArrayList<String> getElementsFromString(String e) {
		ArrayList<String> els = new ArrayList<String>();
		// elimina tutti gli spazi
		String el = e.trim();
		String[] tokens = el.split(" ", 0);
		el = "";
		for (int i = 0; i < tokens.length; i++) {
			el += tokens[i];
		}

		// elimina i dati fra parentesi
		int start = el.indexOf('[');
		if (start >= 0) {
			int end = el.indexOf(']');
			if (end >= start) {
				String s1 = (start > 0) ? el.substring(0, start) : "";
				String s2 = (end < el.length()) ? el.substring(end + 1) : "";
				el = s1 + s2;
			}
		}
		String[] ratios = { "_" };

		for (String r : ratios) {
			tokens = el.split(r, 0);
			for (String t : tokens) {
				els.add(t);
			}
		}
		return els;
	}

	public static void main(String[] args) {
		ElementQuery eq = new ElementQuery();
		ArrayList<String> e = eq.getElementsFromString("SC(PPM)");
		System.out.println(e.toString());
		e = eq.getElementsFromString("SR87_SR86");
		System.out.println(e.toString());
	}

}
