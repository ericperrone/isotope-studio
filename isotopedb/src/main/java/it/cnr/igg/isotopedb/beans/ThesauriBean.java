package it.cnr.igg.isotopedb.beans;

import java.util.ArrayList;

public class ThesauriBean {
	private Integer id;
	private String key;
	private String src;
	private String tableName;
	private ArrayList<Object> content;
	
	public ThesauriBean(Integer id, String key, String src, String tableName) {
		super();
		this.id = id;
		this.key = key;
		this.src = src;
		this.tableName = tableName;
		this.content  = new ArrayList<Object>();
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getSrc() {
		return src;
	}

	public void setSrc(String src) {
		this.src = src;
	}

	public String getTableName() {
		return tableName;
	}

	public void setTableName(String tableName) {
		this.tableName = tableName;
	}
	
	public ArrayList<Object> getContent() {
		return content;
	}
	
	public void addContent(Object o) {
		content.add(o);
	}
	
	
}
