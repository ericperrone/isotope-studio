package it.cnr.igg.isotopedb.beans;

public class DatasetFullLinkBean extends TheBean {
	private String link;
	private String metadata;
	
	public DatasetFullLinkBean(String link, String metadata) {
		super();
		this.link = link;
		this.metadata = metadata;
	}

	public String getLink() {
		return link;
	}

	public String getMetadata() {
		return metadata;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}
}
