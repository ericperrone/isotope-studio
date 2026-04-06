package it.cnr.igg.isotopedb.beans;

public class SampleFieldBean extends TheBean {
	private Long sampleFieldId;
	private String fieldName;
	private String fieldValue;
	
	public SampleFieldBean() {
		
	}

	public SampleFieldBean(String fieldName, String fieldValue) {
		super();
		this.fieldName = fieldName;
		this.fieldValue = fieldValue;
	}

	public Long getSampleFieldId() {
		return sampleFieldId;
	}

	public String getFieldName() {
		return fieldName;
	}

	public String getFieldValue() {
		return fieldValue;
	}

	public void setSampleFieldId(Long sampleFieldId) {
		this.sampleFieldId = sampleFieldId;
	}

	public void setFieldName(String fieldName) {
		this.fieldName = fieldName;
	}

	public void setFieldValue(String fieldValue) {
		this.fieldValue = fieldValue;
	}
	
	public boolean compareTo(SampleFieldBean sfb) {
		return (sfb.getFieldName().equalsIgnoreCase(fieldName));
	}
	

}
