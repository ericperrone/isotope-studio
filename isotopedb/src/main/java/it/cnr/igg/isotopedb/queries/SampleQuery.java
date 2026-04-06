package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import it.cnr.igg.isotopedb.beans.AttributeBean;
import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.beans.ComponentBean;
import it.cnr.igg.isotopedb.beans.DatasetBean;
import it.cnr.igg.isotopedb.beans.ElementBean;
import it.cnr.igg.isotopedb.beans.MatrixBean;
import it.cnr.igg.isotopedb.beans.SampleBean;
import it.cnr.igg.isotopedb.beans.SampleFieldBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.tools.QueryFilter;
import it.cnr.igg.isotopedb.tools.QueryFilterItem;

public class SampleQuery extends Query {
	public final String TYPE_FIELD = "F";
	public final String TYPE_ISOTOPE = "I";
	public final String TYPE_CHEM = "C";
	public final String GEOROC_TAG = "GEOROC_ID";

	public SampleQuery() {
		super();
	}

	public AttributeBean getSampleAttribute(Long id, String name) throws Exception, DbException {
		try {
			Connection con = null;
			con = cm.createConnection();
//			String query = "select * from sample_attribute sa where sa.sample_id = ? and sa.name = ?";
			
			String query = "select * from sample_attribute sa where sa.sample_id = ? and (lower(sa.name) = lower(?) or lower(sa.name) in (select distinct lower(s.synonym) as alias from synonyms s where lower(s.name) = lower(?)))";
			
			PreparedStatement ps = con.prepareStatement(query);
			ps.setLong(1, id);
			ps.setString(2, name);
			ps.setString(3, name);
			ResultSet rs = ps.executeQuery();
			if (rs.next()) {
				return new AttributeBean(rs.getLong("sample_id"), rs.getString("type"), rs.getString("name"),
						rs.getString("svalue"), rs.getString("um"), rs.getString("technique"),
						rs.getString("uncertainty"), rs.getString("uncertainty_type"), rs.getString("refstd"), rs.getString("jvalue"),
						rs.getFloat("nvalue"));
			}
			return new AttributeBean(-1L, "", "", "", "", "", "", "", "", "", 0F);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			cm.closeConnection();
		}
	}

	public int insertExternalSample(ArrayList<AuthorBean> authors, DatasetBean dataset, SampleBean sample)
			throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			con.setAutoCommit(false); // start transaction

			//
			// [1] try to insert missing authors
			//
			AuthorQuery authorQuery = new AuthorQuery();
			for (AuthorBean authorBean : authors) {
				AuthorBean check = authorQuery.getAuthor(authorBean.getSurname(), authorBean.getName(), con);
				if (check.getId() == -1L) {
					authorBean = authorQuery.insert(authorBean, con);
				}
			}
			//
			// [2] try to insert the dataset
			//
			DatasetQuery datasetQuery = new DatasetQuery();
			DatasetBean datasetBean = datasetQuery.findByLink(dataset.getLink(), con);
			if (datasetBean == null) {
				dataset.setProcessed(true);
				datasetBean = datasetQuery.insertDataset(dataset, true, con);
			}
			//
			// [3] try to insert the sample
			//
			String sampleExternalId = "";
			List<SampleFieldBean> fields = sample.getFields();
			for (SampleFieldBean sfb : fields) {
				if (sfb.getFieldName().equalsIgnoreCase(GEOROC_TAG)) {
					sampleExternalId = sfb.getFieldValue();
				}
			}

			if (!checkSampleByExternalID("GEOROC_ID", sampleExternalId, con)) {
				ArrayList<SampleBean> samples = new ArrayList<SampleBean>();
				sample.setDatasetId(datasetBean.getId());
				samples.add(sample);
				insertSamples(samples, con);
				return 1;
			}
			return 0;
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			con.setAutoCommit(true);
			cm.closeConnection();
		}
	}

	private boolean checkSampleByExternalID(String tagname, String id, Connection con) throws Exception {
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			String query = "select count(*) as counter from sample_attribute "
					+ "where type = 'F' and upper(\"name\") = ? and svalue = ?";
			ps = con.prepareStatement(query);
			ps.setString(1, tagname);
			ps.setString(2, id);
			rs = ps.executeQuery();
			rs.next();
			int result = rs.getInt(1);
			return (result > 0);
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

	public ArrayList<SampleBean> querySamplesById(ArrayList<Integer> ids) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			return querySamplesById(ids, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			cm.closeConnection();
		}
	}

	public ArrayList<SampleBean> querySamplesById(ArrayList<Integer> ids, Connection con)
			throws Exception, DbException {
		ArrayList<SampleBean> beans = new ArrayList<SampleBean>();
		PreparedStatement ps = null;
		ResultSet rs = null;

		String select1 = "select distinct si.sample_id, si.dataset_id, sa.type, sa.name, sa.svalue, sa.nvalue "
				+ "from sample_index si, sample_attribute sa "
				+ "where sa.type in ('I', 'C') and sa.sample_id = si.sample_id and si.sample_id in (";
		String select2 = ") order by si.sample_id";

		try {
			String content = "";
			for (Integer id : ids) {
				content += id + ",";
			}
			content = content.substring(0, content.length() - 1);
			String select = select1 + content + select2;
			System.out.println(select);

			ps = con.prepareStatement(select);
			rs = ps.executeQuery();

			HashMap<Long, SampleBean> index = new HashMap<Long, SampleBean>();

			while (rs.next()) {
				Long sampleId = rs.getLong("sample_id");
				SampleBean bean;
				if (index.containsKey(sampleId)) {
					bean = index.get(sampleId);
				} else {
					bean = new SampleBean();
					bean.setId(sampleId);
					bean.setComponents(new ArrayList<ComponentBean>());
					index.put(sampleId, bean);
				}
				ComponentBean cBean = new ComponentBean();
				cBean.setComponent(rs.getString("name"));
				String type = rs.getString("type");
				cBean.setIsIsotope(type.compareTo("I") == 0);
				cBean.setValue(rs.getDouble("nvalue"));
				bean.getComponents().add(cBean);
			}

			index.forEach((id, bean) -> beans.add(bean));

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
		}
	}

//	public ArrayList<SampleBean> queryInfo(ArrayList<QueryFilter> filters, Connection con) throws Exception, DbException {
//		
//	}
	public ArrayList<SampleBean> querySampleInfo(ArrayList<QueryFilter> filters, Connection con)
			throws Exception, DbException {
		Boolean isOR = false;
		ArrayList<SampleBean> beans = new ArrayList<SampleBean>();
		if (filters.size() < 1) {
			return beans;
		}
		PreparedStatement ps = null;
		ResultSet rs = null;
		String queryData = "select distinct si.sample_id, si.dataset_id, sa.type, sa.name, sa.svalue, sa.nvalue, sa.um, sa.technique, sa.uncertainty, sa.uncertainty_type, sa.refstd, "
				+ "c.latitude, c.longitude, " + "m.matrix, m.nodeid, m.parent_nodeid, " + "s.name as synonym "
				+ "from sample_index si, sample_attribute sa " + "left join coord c on c.sample_id = sa.sample_id "
				+ "left join synonyms s on s.synonym = regexp_replace(sa.name, ' \\[.*\\]', '') "
				+ "left join sample_matrix sm on sm.sample_id = sa.sample_id "
				+ "left join matrix m on sm.matrix_id = m.nodeid " + "where type in ('F', 'I', 'C') "
				+ "and sa.sample_id = si.sample_id ";

		for (QueryFilter f : filters) {
			if (f.operator != null && f.operator.equalsIgnoreCase("or")) {
				isOR = true;
				break;
			}
			if (f.datasets != null) {
				for (QueryFilterItem a : f.datasets) {
					if (a.operator.equalsIgnoreCase("or")) {
						isOR = true;
						break;
					}
				}
			}
		}

		if (filters.size() > 0 && isOR == false)
			queryData += "and ( 1=1 ";
		if (filters.size() > 0 && isOR == true)
			queryData += "and ( 1=2 ";

		for (QueryFilter f : filters) {
			if ((f.datasets != null) && f.datasets.size() > 0) {
				ArrayList<QueryFilterItem> authors = f.getDatasetItemsByType(QueryFilterItem.TYPE_AUTHOR);
				ArrayList<QueryFilterItem> keywords = f.getDatasetItemsByType(QueryFilterItem.TYPE_KEYWORD);
				ArrayList<QueryFilterItem> references = f.getDatasetItemsByType(QueryFilterItem.TYPE_REFERENCE);
				ArrayList<QueryFilterItem> years = f.getDatasetItemsByType(QueryFilterItem.TYPE_YEAR);

				if (authors.size() > 0) {
					queryData += authors.get(0).operator + " (";
					int n = 1;
					for (QueryFilterItem qfi : authors) {
						queryData += n > 1 ? " or si.dataset_id in (" : "si.dataset_id in (";
						queryData += qfi.bean.getId() + ",";
						queryData = queryData.substring(0, queryData.length() - 1);
						queryData += ")";
						n++;
					}
					queryData += ") ";
				}

				if (keywords.size() > 0) {
					queryData += keywords.get(0).operator + " (";
					int n = 1;
					for (QueryFilterItem qfi : keywords) {
						queryData += n > 1 ? " or si.dataset_id in (" : "si.dataset_id in (";
						queryData += qfi.bean.getId() + ",";
						queryData = queryData.substring(0, queryData.length() - 1);
						queryData += ")";
						n++;
					}
					queryData += ") ";
				}

				if (references.size() > 0) {
					queryData += references.get(0).operator + " (";
					int n = 1;
					for (QueryFilterItem qfi : references) {
						queryData += n > 1 ? " or si.dataset_id in (" : " si.dataset_id in (";
						queryData += qfi.bean.getId() + ",";
						queryData = queryData.substring(0, queryData.length() - 1);
						queryData += ")";
						n++;
					}
					queryData += ") ";
				}

				if (years.size() > 0) {
					queryData += years.get(0).operator + " (";
					int n = 1;
					for (QueryFilterItem qfi : years) {
						queryData += n > 1 ? " or si.dataset_id in (" : " si.dataset_id in (";
						queryData += qfi.bean.getId() + ",";
						queryData = queryData.substring(0, queryData.length() - 1);
						queryData += ")";
					}
					queryData += ") ";
				}

//				for (QueryFilterItem qfi : authors) {
//					queryData += nFilter > 1 ? " " + qfi.operator : " ";
//					queryData += " si.dataset_id in (";
//					queryData += qfi.bean.getId() + ",";
//					queryData = queryData.substring(0, queryData.length() - 1);
//					queryData += ")";
//					++nFilter;
//				}
			}
			if (f.coordinates != null) {
//				queryData += nFilter > 1 ? " " + f.operator: " ";
				queryData += f.operator + " (latitude >= " + f.coordinates.minLat + " and latitude <= "
						+ f.coordinates.maxLat;
				queryData += " and longitude >= " + f.coordinates.minLong + " and longitude <= " + f.coordinates.maxLong
						+ ") ";
//				++nFilter;
			}
			if (f.matrixId != null) {
				MatrixQuery mq = new MatrixQuery();
				ArrayList<Integer> nodeIds = mq.getSubTree(con, f.matrixId);
				String in = "";
				for (Integer id : nodeIds) {
					in += id + ",";
				}
				in = in.substring(0, in.length() - 1);
//				queryData += nFilter > 1 ? " " + f.operator : " ";
				queryData += f.operator + " sm.matrix_id in (" + in + ") ";
//				++nFilter;
			}
		}
		if (filters.size() > 0)
			queryData += ")";

		queryData += " order by si.sample_id";

		try

		{
			System.out.println(queryData);
			// getSubTree
			HashMap<Long, SampleBean> index = new HashMap<Long, SampleBean>();

			ps = con.prepareStatement(queryData);
			rs = ps.executeQuery();
			while (rs.next()) {
				Long id = rs.getLong("sample_id");
				if (index.get(id) == null) {
					SampleBean bean = new SampleBean();
					bean.setId(id);
					Long datasetId = rs.getLong("dataset_id");
					if (datasetId > 0)
						bean.setDatasetId(datasetId);
					bean.setFields(new ArrayList<SampleFieldBean>());
					bean.setComponents(new ArrayList<ComponentBean>());
					SampleFieldBean sfb = new SampleFieldBean("ITINERIS_ID", "" + id);
					bean.getFields().add(sfb);
					index.put(id, bean);
				}
				String matrix = rs.getString("matrix");
				if (matrix != null) {
					index.get(id).setMatrix(new MatrixBean(rs.getLong("nodeid"), rs.getLong("parent_nodeid"), matrix));
					SampleFieldBean sfb = new SampleFieldBean("MATRIX", matrix);
					index.get(id).getFields().add(sfb);
				}

				String type = rs.getString("type");
				switch (type) {
				case TYPE_FIELD:
					index.get(id).getFields().add(setField(rs));
					break;
				case TYPE_ISOTOPE:
					index.get(id).getComponents().add(setIsotope(rs));
					break;
				case TYPE_CHEM:
					index.get(id).getComponents().add(setChem(rs));
					break;
				}
			}

			index.forEach((id, bean) -> beans.add(bean));

			beans.sort((a, b) -> {return (int)(a.getId() - b.getId()); });
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
		}
	}

	public ArrayList<SampleBean> querySamples(QueryFilter filter, Connection con) throws Exception, DbException {
		ArrayList<SampleBean> beans = new ArrayList<SampleBean>();
		PreparedStatement ps = null;
		ResultSet rs = null;
		try {
			String queryData = "select distinct si.sample_id, si.dataset_id, sa.type, sa.name, sa.svalue, sa.nvalue, c.latitude, c.longitude, "
					+ "m.matrix, " + "s.name as synonym " + "from sample_index si, sample_attribute sa "
					+ "left join coord c on c.sample_id = sa.sample_id "
					+ "left join synonyms s on s.synonym = regexp_replace(sa.name, ' \\[.*\\]', '') "
					+ "left join matrix m on sm.matrix_id = m.nodeid " + "where type in ('F', 'I', 'C') "
					+ "and sa.sample_id = si.sample_id ";
			if (filter.datasets.size() > 0) {
				queryData += " and si.dataset_id in (";
				for (QueryFilterItem db : filter.datasets) {
					queryData += db.bean.getId() + ",";
				}
				queryData = queryData.substring(0, queryData.length() - 1);
				queryData += ")";
			}
			if (filter.coordinates != null) {
				queryData += " and latitude >= " + filter.coordinates.minLat + " and latitude <= "
						+ filter.coordinates.maxLat;
				queryData += " and longitude >= " + filter.coordinates.minLong + " and longitude <= "
						+ filter.coordinates.maxLong;
			}
			queryData += " order by si.sample_id";

			System.out.println(queryData);
			HashMap<Long, SampleBean> index = new HashMap<Long, SampleBean>();

			ps = con.prepareStatement(queryData);
			rs = ps.executeQuery();
			while (rs.next()) {
				Long id = rs.getLong("sample_id");
				if (index.get(id) == null) {
					SampleBean bean = new SampleBean();
					Long datasetId = rs.getLong("dataset_id");
					if (datasetId > 0)
						bean.setDatasetId(datasetId);
					bean.setFields(new ArrayList<SampleFieldBean>());
					bean.setComponents(new ArrayList<ComponentBean>());
					SampleFieldBean sfb = new SampleFieldBean("ITINERIS_ID", "" + id);
					bean.getFields().add(sfb);
					index.put(id, bean);
				}
				String type = rs.getString("type");
				switch (type) {
				case TYPE_FIELD:
					index.get(id).getFields().add(setField(rs));
					break;
				case TYPE_ISOTOPE:
					index.get(id).getComponents().add(setIsotope(rs));
					break;
				case TYPE_CHEM:
					index.get(id).getComponents().add(setChem(rs));
					break;
				}
			}

			index.forEach((id, bean) -> beans.add(bean));

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
		}
	}

	public ArrayList<SampleBean> querySamples(QueryFilter filter) throws Exception, DbException {
		try {
			Connection con = cm.createConnection();
			return querySamples(filter, con);
		} catch (Exception ex) {
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			cm.closeConnection();
		}
	}

	public void insertSamples(ArrayList<SampleBean> samples, Connection con) throws Exception, DbException {
		PreparedStatement ps = null;
		ResultSet rs = null;
		String insertSample = "insert into sample_index (ts, dataset_id) values(now(), ?);";
		String getSampleId = "SELECT currval(pg_get_serial_sequence(\'sample_index\',\'sample_id\')) as sample_id";
		String insertField = "insert into sample_attribute (sample_id, type, name, svalue) values (?, ?, ?, ?)";
		String insertChem = "insert into sample_attribute (sample_id, type, name, nvalue, um, technique, uncertainty, uncertainty_type, refstd) values (?, ?, ?, ?, ?, ?, ?, ?, ?)";
		String insertCoord = "insert into coordinates (sample_id, latitude, longitude) values (?, ?, ?)";
		try {
			ElementQuery eq = new ElementQuery();
			HashMap<String, ElementBean> hm = new HashMap<String, ElementBean>();

			for (SampleBean sb : samples) {
				// step 1: insert master record
				ps = con.prepareStatement(insertSample);
				ps.setLong(1, sb.getDatasetId() >= 0 ? sb.getDatasetId() : null);
				ps.execute();
				ps.close();
				ps = null;

				// step 2: get master record id
				ps = con.prepareStatement(getSampleId);
				rs = ps.executeQuery();
				if (!rs.next())
					throw new DbException("Invalid sequence value");
				Long sampleId = rs.getLong("sample_id");
				rs.close();
				rs = null;
				ps.close();
				ps = null;

				Double[] coord = { null, null };
				Long matrixId = -1L;

				// step 3: insert attributes
				List<SampleFieldBean> fields = sb.getFields();
				for (SampleFieldBean sfb : fields) {
					String value = sfb.getFieldValue();
					if (value != null && value.length() > 0) {
						ps = con.prepareStatement(insertField);
						ps.setLong(1, sampleId);
						ps.setString(2, TYPE_FIELD);
						ps.setString(3, sfb.getFieldName());
						ps.setString(4, value);
						ps.execute();
						ps.close();
						ps = null;

						String name = sfb.getFieldName().toLowerCase();
						if (name.contains("latitude")) {
							value = value.replaceAll(",", ".");
							if (value.indexOf("°") > 0) {
								value = parseGps(value);
							}
							coord[0] = Double.valueOf(value);
						}
						if (name.contains("longitude")) {
							value = value.replaceAll(",", ".");
							if (value.indexOf("°") > 0) {
								value = parseGps(value);
							}
							coord[1] = Double.valueOf(value);
						}
						if (coord[0] != null && coord[1] != null) {
							ps = con.prepareStatement(insertCoord);
							ps.setLong(1, sampleId);
							ps.setDouble(2, coord[0]);
							ps.setDouble(3, coord[1]);
							ps.execute();
							ps.close();
							ps = null;
						}
						if (name.equals("matrix") && matrixId < 0L) {
							MatrixBean mb = new MatrixQuery().getMatrixByName(con, value.toLowerCase());
							if (mb != null) {
								matrixId = mb.getNodeId();
							}
						}
						if (name.equals("matrix_details")) {
							MatrixBean mb = new MatrixQuery().getMatrixByName(con, value.toLowerCase());
							if (mb != null) {
								matrixId = mb.getNodeId();
							}
						}
					}
				}

				// step 3bis: insert matrix
				if (matrixId > 0) {
					new MatrixQuery().insertSampleMatrix(con, sampleId, matrixId);
				}

				// step 4: insert chemical components
				List<ComponentBean> components = sb.getComponents();
				for (ComponentBean cb : components) {
					Double value = cb.getValue();
					if (value != null && value != 0) {
						ps = con.prepareStatement(insertChem);
						ps.setLong(1, sampleId);
						ps.setString(2, cb.getIsIsotope() == true ? TYPE_ISOTOPE : TYPE_CHEM);
						ps.setString(3, cb.getComponent().trim());
						ps.setDouble(4, value);
						if (cb.getIsIsotope() == false)
							ps.setString(5, cb.getUm());
						else
							ps.setNull(5, Types.VARCHAR);
						if (cb.getTechnique() != null)
							ps.setString(6, cb.getTechnique());
						else
							ps.setNull(6, Types.VARCHAR);
						if (cb.getUncertainty() != null)
							ps.setString(7, cb.getUncertainty());
						else
							ps.setNull(7, Types.VARCHAR);
						if (cb.getUncertaintyType() != null)
							ps.setString(8, cb.getUncertaintyType());
						else
							ps.setNull(8, Types.VARCHAR);
						if (cb.getRefstd() != null)
							ps.setString(9, cb.getRefstd());
						else
							ps.setNull(9, Types.VARCHAR);

						ps.execute();
						ps.close();
						ps = null;
						if (!hm.containsKey(cb.getComponent().toLowerCase())) {
							hm.put(cb.getComponent().toLowerCase(), toElementBean(cb));
						}
					}
				}

				// step 5: set matrix
				if (sb.getMatrix() != null) {
					MatrixQuery mq = new MatrixQuery();
					ArrayList<MatrixBean> beans = new ArrayList<MatrixBean>();
					beans.add(sb.getMatrix());
					mq.insertSampleMatrix(sampleId, beans);
				}
			}
			ArrayList<ElementBean> ls = new ArrayList<ElementBean>();
			for (ElementBean em : hm.values()) {
				ls.add(em);
			}
			eq.testElements(ls, con);
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

	public void insertSamples(ArrayList<SampleBean> samples) throws Exception, DbException {
		Connection con = null;
		try {
			con = cm.createConnection();
			con.setAutoCommit(false); // start transaction
			insertSamples(samples, con);
			con.commit();
		} catch (Exception ex) {
			if (con != null)
				con.rollback();
			ex.printStackTrace();
			throw new DbException(ex);
		} finally {
			con.setAutoCommit(true); // end transaction
			cm.closeConnection();
		}
	}

	public String[] toEpsg4326(String lat, String lon) {
		String[] epsg4326 = { lat, lon };
		if (lat.indexOf("°") > 0 && lon.indexOf("°") > 0) {
			epsg4326 = gps2Epsg4326(lat, lon);
		}
		return epsg4326;
	}

	private String[] gps2Epsg4326(String lat, String lon) {
		String[] epsg4326 = { "", "" };
		lat = removeSpaces(lat);
		lon = removeSpaces(lon);
		epsg4326[0] = parseGps(lat);
		epsg4326[1] = parseGps(lon);
		return epsg4326;
	}

	private String parseGps(String s) {
		s = s.replaceAll(" ", "");
		s = s.replaceAll("\"", "''");
		s = s.replaceAll("′", "'");
		s = s.replaceAll("″", "''");
		String gradi = s.substring(0, s.indexOf("°"));
		String primi = s.substring(s.indexOf("°") + 1, s.indexOf("'"));
		String secondi = s.substring(s.indexOf("'") + 1, s.indexOf("''"));
		Double g = Double.valueOf(gradi);
		Double p = Double.valueOf(primi);
		Double sc = Double.valueOf(secondi);
		Double gr = g + p / 60d + sc / 3600d;
		return "" + gr;
	}

	private String removeSpaces(String s) {
		s = s.trim();
		String ss[] = s.split(" ");
		s = "";
		for (String i : ss) {
			s += i;
		}
		return s;
	}

	public static void main(String[] args) {
//		String lat = "45° 28' 12'' N";
//		String lon = "9° 10' 12'' E";
		// 38°45'18''N

		SampleQuery sq = new SampleQuery();
		String in = "11°05′ 06″ ";
		String ugly = "" + in.charAt(5);
		String ugly2 = "" + in.charAt(9);
		System.out.println(ugly);
		System.out.println(ugly2);

		sq.parseGps(in);
//		String[] coord = sq.toEpsg4326(lat, lon);
//		System.out.println(coord[0]);
//		System.out.println(coord[1]);
//
//		lat = "38°45'18''N";
//		lon = "34°36'44''E";
//		coord = sq.toEpsg4326(lat, lon);
//		System.out.println(coord[0]);
//		System.out.println(coord[1]);
	}

	private ElementBean toElementBean(ComponentBean bean) {
		ElementBean cBean = new ElementBean();
		cBean.setIsotope(bean.getIsIsotope());
		cBean.setElement(bean.getComponent());
		return cBean;
	}

	private SampleFieldBean setField(ResultSet rs) throws Exception {
		SampleFieldBean sfb = new SampleFieldBean();
		sfb.setFieldName(rs.getString("name"));
		sfb.setFieldValue(rs.getString("svalue"));
		return sfb;
	}

	private ComponentBean setIsotope(ResultSet rs) throws Exception {
		ComponentBean sfb = new ComponentBean();
		String name = rs.getString("name");
		String um = "";
		int i = name.indexOf(" (");
		if (i > -1)
			um += name.substring(i);
		String synonym = rs.getString("synonym");
		if (synonym == null)
			sfb.setComponent(name);
		else
			sfb.setComponent(synonym + um);
		sfb.setValue(rs.getDouble("nvalue"));
		sfb.setIsIsotope(true);
		return sfb;
	}

	private ComponentBean setChem(ResultSet rs) throws Exception {
		ComponentBean sfb = new ComponentBean();
		String name = rs.getString("name");
		String um = rs.getString("um");
//		int i = name.indexOf(" [");
//		if (i > -1)
//			um += name.substring(i);
		String synonym = rs.getString("synonym");
		if (synonym == null)
			sfb.setComponent(name);
		else
			sfb.setComponent(synonym);
		sfb.setValue(rs.getDouble("nvalue"));
		sfb.setIsIsotope(false);
		sfb.setUm(um);
		return sfb;
	}

	private SampleFieldBean rsToSampleFieldBean(ResultSet rs) throws SQLException {
		SampleFieldBean sfb = new SampleFieldBean();
		String field = rs.getString("field");
		String value = rs.getString("value");
		sfb.setFieldName(field);
		sfb.setFieldValue(value);
		return sfb;
	}

	private ComponentBean rsTocomponentBean(ResultSet rs) throws SQLException {
		ComponentBean cb = new ComponentBean();
		String component = rs.getString("element");
		Double value = rs.getDouble("cvalue");
		Boolean isotope = rs.getBoolean("isotope");
		cb.setComponent(component);
		cb.setValue(value);
		cb.setIsIsotope(isotope);
		return cb;
	}
}
