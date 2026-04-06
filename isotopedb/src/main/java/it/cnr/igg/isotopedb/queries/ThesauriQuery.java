package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;

import it.cnr.igg.isotopedb.beans.ThesauriBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

class Uuid {
	public String uuid;
}

class Project extends Uuid {
	public String shortName, longName;
	
	public Project(String shortName, String longName, String uuid) {
		this.shortName = shortName;
		this.longName = longName;
		this.uuid = uuid;
	}
}

class Provider extends Uuid {
	public String bucketLevel0, bucketLevel1, bucketLevel2, bucketLevel3, shortName, lonhName, dataCenterUrl;

	public Provider(String bucketLevel0, String bucketLevel1, String bucketLevel2, String bucketLevel3,
			String shortName, String lonhName, String dataCenterUrl, String uuid) {
		super();
		this.bucketLevel0 = bucketLevel0;
		this.bucketLevel1 = bucketLevel1;
		this.bucketLevel2 = bucketLevel2;
		this.bucketLevel3 = bucketLevel3;
		this.shortName = shortName;
		this.lonhName = lonhName;
		this.dataCenterUrl = dataCenterUrl;
		this.uuid = uuid;
	}
}

class MeasurementName extends Uuid {
	public String contextMedium, object, quantity;

	public MeasurementName(String contextMedium, String object, String quantity, String uuid) {
		super();
		this.contextMedium = contextMedium;
		this.object = object;
		this.quantity = quantity;
		this.uuid = uuid;
	}
}

class ChronoUnits extends Uuid {
	public String eon, era, period, epoch, age, subAge;

	public ChronoUnits(String eon, String era, String period, String epoch, String age, String subAge, String uuid) {
		super();
		this.eon = eon;
		this.era = era;
		this.period = period;
		this.epoch = epoch;
		this.age = age;
		this.subAge = subAge;
		this.uuid = uuid;
	}
}

class Locations extends Uuid {
	public String category, type, subregion1, subregion2, subregion3, subregion4;

	public Locations(String category, String type, String subregion1, String subregion2, String subregion3,
			String subregion4, String uuid) {
		super();
		this.category = category;
		this.type = type;
		this.subregion1 = subregion1;
		this.subregion2 = subregion2;
		this.subregion3 = subregion3;
		this.subregion4 = subregion4;
		this.uuid = uuid;
	}
}

class ScienceKeywords extends Uuid {
	public String category, topic, term, variableLevel1, variableLevel2, variableLevel3, detailedVariable;

	public ScienceKeywords(String category, String topic, String term, String variableLevel1, String variableLevel2,
			String variableLevel3, String detailedVariable, String uuid) {
		super();
		this.category = category;
		this.topic = topic;
		this.term = term;
		this.variableLevel1 = variableLevel1;
		this.variableLevel2 = variableLevel2;
		this.variableLevel3 = variableLevel3;
		this.detailedVariable = detailedVariable;
		this.uuid = uuid;
	}
}

class Platforms extends Uuid {
	public String basis, category, subCategory, shortName, longName;

	public Platforms(String basis, String category, String subCategory, String shortName, String longName, String uuid) {
		super();
		this.basis = basis;
		this.category = category;
		this.subCategory = subCategory;
		this.shortName = shortName;
		this.longName = longName;
		this.uuid = uuid;
	}
}

public class ThesauriQuery extends Query {
	public ThesauriQuery() {
		super();
	}

	public ArrayList<ThesauriBean> getThesauriList() throws DbException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ArrayList<ThesauriBean> beans = new ArrayList<ThesauriBean>();
		try {
			con = cm.createConnection();
			ps = con.prepareStatement("select * from thesauri");
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				beans.add(new ThesauriBean(rs.getInt("id"), rs.getString("key"), rs.getString("src"),
						rs.getString("table_name")));
			}
			return beans;
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
			if (con != null)
				con.close();
		}
	}

	public ThesauriBean getThesauri(Integer id) throws DbException, Exception {
		Connection con = null;
		PreparedStatement ps = null;
		ThesauriBean bean;
		String getBean = "select key, src, table_name from thesauri where id = ?";
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(getBean);
			ps.setInt(1, id);
			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				bean = new ThesauriBean(id, rs.getString("key"), rs.getString("src"), rs.getString("table_name"));
				getContent(bean, con);
			} else {
				throw new DbException("Not found [id = " + id + "]");
			}
			return bean;
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
			if (con != null)
				con.close();
		}
	}

	public void getContent(ThesauriBean bean, Connection con) throws DbException {
		String tbName = bean.getTableName();
		try {
			if (tbName.equals("locations"))
				getLocations(bean, con);
			else if(tbName.equals("sciencekeywords"))
				getScienceKeywords(bean, con);
			else if (tbName.equals("platforms"))
				getPlatforms(bean, con);
			else if (tbName.equals("chronounits"))
				getChronoUnits(bean, con);
			else if (tbName.equals("measurementname"))
				getMeasurementName(bean, con);
			else if (tbName.equals("projects"))
				getProjects(bean, con);
			else if (tbName.equals("providers"))
				getProviders(bean, con);
			else 
				throw new DbException("Unexpected condition");
		} catch (Exception e) {
			throw new DbException(e);
		}
	}
	
	private void getProjects(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from projects order by short_name, long_name";
		PreparedStatement ps = null;
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new Project(rs.getString("short_name"), rs.getString("long_name"), rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}		
	}

	private void getProviders(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from providers order by bucket_level0, bucket_level1, bucket_level2, bucket_level3";
		PreparedStatement ps = null;
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new Provider(rs.getString("bucket_level0"), rs.getString("bucket_level1"), rs.getString("bucket_level2"), rs.getString("bucket_level3"),
						rs.getString("short_name"), rs.getString("long_name"), rs.getString("data_center_url"), rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}
	}

	private void getMeasurementName(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from measurementname order by context_medium, object, quantity";
		PreparedStatement ps = null;
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new MeasurementName(rs.getString("context_medium"), rs.getString("object"),
						rs.getString("quantity"), rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}
	}
	
	
	private void getLocations(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from locations order by location_category, location_type, location_subregion1, location_subregion2, location_subregion3, location_subregion4";
		PreparedStatement ps = null;
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new Locations(rs.getString("location_category"), rs.getString("location_type"),
						rs.getString("location_subregion1"), rs.getString("location_subregion2"),
						rs.getString("location_subregion3"), rs.getString("location_subregion4"),
						rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}
	}
	
	private void getScienceKeywords(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from sciencekeywords order by category, topic, term, variable_level_1, variable_level_2, variable_level_3, detailed_variable";
		PreparedStatement ps = null;	
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new ScienceKeywords(rs.getString("category"), rs.getString("topic"), rs.getString("term"),
						rs.getString("variable_level_1"), rs.getString("variable_level_2"),
						rs.getString("variable_level_3"), rs.getString("detailed_variable"),
						rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}		
	}
	
	private void getPlatforms(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from platforms order by basis, category, sub_category, long_name";
		PreparedStatement ps = null;	
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new Platforms(rs.getString("basis"), rs.getString("category"), rs.getString("sub_category"),
						rs.getString("short_name"), rs.getString("long_name"),
						rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}		
	}
	
	private void getChronoUnits(ThesauriBean bean, Connection con) throws DbException, Exception {
		String query = "select * from chronounits order by eon, era, period, epoch, age, sub_age";
		PreparedStatement ps = null;	
		try {
			con = cm.createConnection();
			ps = con.prepareStatement(query);
			ResultSet rs = ps.executeQuery();
			while (rs.next()) {
				bean.addContent(new ChronoUnits(rs.getString("eon"), rs.getString("era"), rs.getString("period"),
						rs.getString("epoch"), rs.getString("age"), rs.getString("sub_age"),
						rs.getString("uuid")));
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			if (ps != null)
				ps.close();
		}		
	}

}
