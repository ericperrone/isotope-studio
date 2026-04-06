package it.cnr.igg.isotopedb.tools;

import it.cnr.igg.isotopedb.beans.DatasetBean;

public class QueryFilterItem {
	public static final String TYPE_KEYWORD = "K";
	public static final String TYPE_AUTHOR = "A";
	public static final String TYPE_YEAR = "Y";
	public static final String TYPE_REFERENCE = "R";

	public String type;
	public String operator;
	public DatasetBean bean;
	
	public QueryFilterItem(String type, String operator, DatasetBean bean) {
		this.type = type;
		this.operator = operator;
		this.bean = bean;
	}
}
