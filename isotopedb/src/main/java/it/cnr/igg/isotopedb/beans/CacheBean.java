package it.cnr.igg.isotopedb.beans;

public class CacheBean {
	public Long datasetId;
	public String fieldName, fieldType, um, technique, errorType;
	public Float error;
	
	public CacheBean() {
		
	}

	public CacheBean(Long datasetId, String fieldName, String fieldType, String um, String technique, String errorType,
			Float error) {
		super();
		this.datasetId = datasetId;
		this.fieldName = fieldName;
		this.fieldType = fieldType;
		this.um = um;
		this.technique = technique;
		this.errorType = errorType;
		this.error = error;
	}
}
