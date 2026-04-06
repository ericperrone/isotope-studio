package it.cnr.igg.isotopedb.beans;

import com.google.gson.Gson;

public class CountryBean {

	private Long id;
	private String code;
	private String name;
	private String oldName;
	
	public CountryBean(Long id, String code, String name, String oldName) {
		super();
		this.id = id;
		this.code = code;
		this.name = name;
		this.oldName = oldName;
	}

	public CountryBean() {
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public String getName() {
		return name;
	}

	public String getOldName() {
		return oldName;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setOldName(String oldName) {
		this.oldName = oldName;
	}
	
	public String toJson() {
		String json = "";
		Gson gson = new Gson();
		json = gson.toJson(this);
		return json;
	}
}
