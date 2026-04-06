package it.cnr.igg.models;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import it.cnr.igg.isotopedb.beans.SampleBean;
import it.cnr.igg.isotopedb.beans.SampleFieldBean;
import it.cnr.igg.isotopedb.beans.ComponentBean;

class TableItem {
	public String headerName;
	public int headerColumn;
	public String value;
}

public class TableSampleBean {
	public static String[][] equivalent = {
			{ "sample", "sample id", "sample_id", "sample name", "sample_name" }
	};
	private ArrayList<String> header;	
	private ArrayList<ArrayList<String>> body;
	private HashMap<String, TableItem> index;

	public TableSampleBean() {
		header = new ArrayList<String>();
		body = new ArrayList<ArrayList<String>>();
		index = new HashMap<String, TableItem>();
	}

	public ArrayList<String> getHeader() {
		return header;
	}

	public ArrayList<ArrayList<String>> getBody() {
		return body;
	}

	public HashMap<String, TableItem> getIndex() {
		return index;
	}

	public void build(List<SampleBean> beans, boolean typeFlag) {
		buildHeader(beans, typeFlag);
		body.add(header);
		buildBody(beans);
	}

	private void buildBody(List<SampleBean> beans) {
		int rowElements = header.size();
		for (SampleBean s : beans) {
			ArrayList<String> row = new ArrayList<String>();
			for (int i = 0; i < rowElements; i++) {
				row.add("");
			}
			List<SampleFieldBean> fields = s.getFields();
			if (fields != null) {
				for (SampleFieldBean f : fields) {
					TableItem item = index.get(f.getFieldName().toUpperCase());
					row.set(item.headerColumn, f.getFieldValue());
				}
			}
			List<ComponentBean> components = s.getComponents();
			if (components != null) {
				for (ComponentBean c : components) {
					TableItem item = index.get(c.getComponent());
					String value = "" + c.getValue();
					if (c.getUm() != null)
						value += " [" + c.getUm() + "]";
					row.set(item.headerColumn, value);
				}
			}
			body.add(row);
		}
	}
	
	private void organizeFields(SampleBean bean) {
		List<SampleFieldBean> fields = bean.getFields();
		ArrayList<SampleFieldBean> sfb = new ArrayList<SampleFieldBean>();
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("itineris_id")) {
				sfb.add(f);
				break;
			}
		}
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("latitude")) {
				sfb.add(f);
				break;
			}
		}
		
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("longitude")) {
				sfb.add(f);
				break;
			}
		}
		
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("matrix")) {
				sfb.add(f);
				break;
			}
		}
		
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("sample name")) {
				sfb.add(f);
				break;
			}
		}
		
		for (SampleFieldBean f : fields) {
			if (f.getFieldName().equalsIgnoreCase("itineris_id")) {
				continue;
			}
			if (f.getFieldName().equalsIgnoreCase("latitude")) {
				continue;
			}
			if (f.getFieldName().equalsIgnoreCase("longitude")) {
				continue;
			}
			if (f.getFieldName().equalsIgnoreCase("matrix")) {
				continue;
			}
			if (f.getFieldName().equalsIgnoreCase("sample name")) {
				continue;
			}
			sfb.add(f);
		}
		
		bean.setFields(sfb);
	}
	
	private void buildHeader(List<SampleBean> beans, boolean typeFlag) {
		int position = 0;
		for (SampleBean s : beans) {
			organizeFields(s);
			List<SampleFieldBean> fields = s.getFields();
			if (fields != null) {
				for (SampleFieldBean f : fields) {
					String name = f.getFieldName().toUpperCase();
					//String name = f.getFieldName();
					if (index.get(name) == null) {
						TableItem item = new TableItem();
						item.headerColumn = position;
						item.headerName = name;
						index.put(name, item);
						position++;
						header.add(typeFlag == false ? name : "F\\" + name);
					}
				}
			}
		}
		for (SampleBean s : beans) {
			List<ComponentBean> components = s.getComponents();
			if (components != null) {
				for (ComponentBean f : components) {
					// String component = f.getComponent().toUpperCase();
					String component = f.getComponent();
					if (index.get(component) == null) {
						if (!f.getIsIsotope()) {
							TableItem item = new TableItem();
							item.headerColumn = position;
							item.headerName = component;
							index.put(component, item);
							position++;
							header.add(typeFlag == false ? component : "C\\" + component);
						}
					}
				}
			}
		}
		for (SampleBean s : beans) {
			List<ComponentBean> components = s.getComponents();
			if (components != null) {
				for (ComponentBean f : components) {
					// String component = f.getComponent().toUpperCase();
					String component = f.getComponent();
					if (index.get(component) == null) {
						if (f.getIsIsotope()) {
							TableItem item = new TableItem();
							item.headerColumn = position;
							item.headerName = component;
							index.put(component, item);
							position++;
							header.add(typeFlag == false ? component : "I\\" + component);
						}
					}
				}
			}
		}
	}
}
