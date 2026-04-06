package it.cnr.igg.isotopedb.beans;

public class DatasetBean extends TheBean {
	private Long id;
	private String fileName, keywords;
	private String authors, link;
	private Integer year;
	private boolean processed;
	private String metadata;
	
	public DatasetBean(String fileName, String keywords,
			String authors, String link,
			int year,
			boolean processed) {
		super();
		this.fileName = fileName;
		this.keywords = keywords;
		this.processed = processed;
		this.authors = authors;
		this.link = link;
		this.year = year;
	}
	
	public DatasetBean(Long id, String fileName, String keywords,
			String authors, String link,
			int year,
			boolean processed) {
		super();
		this.id = id;
		this.fileName = fileName;
		this.keywords = keywords;
		this.processed = processed;
		this.authors = authors;
		this.link = link;
		this.year = year;
	}
	
	public DatasetBean(Long id, String fileName, String keywords,
			String authors, String link, String metadata,
			int year,
			boolean processed) {
		super();
		this.id = id;
		this.fileName = fileName;
		this.keywords = keywords;
		this.processed = processed;
		this.authors = authors;
		this.link = link;
		this.metadata = metadata;
		this.year = year;
	}

	public DatasetBean() {
		super();
		this.id = -1L;
		this.fileName = null;
		this.keywords = null;
		this.authors = null;
		this.link = null;
		this.year = -1;
		this.processed = false;
	}

	public String getAuthors() {
		return authors;
	}

	public String getLink() {
		return link;
	}

	public int getYear() {
		return year;
	}

	public Long getId() {
		return id;
	}

	public String getFileName() {
		return fileName;
	}

	public String getKeywords() {
		return keywords;
	}
	
	public String getMetadata() {
		return metadata;
	}

	public boolean isProcessed() {
		return processed;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public void setMetadata(String metadata) {
		this.metadata = metadata;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public void setKeywords(String keywords) {
		this.keywords = keywords;
	}

	public void setProcessed(boolean processed) {
		this.processed = processed;
	}

	public void setAuthors(String authors) {
		this.authors = authors;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public void setYear(Integer year) {
		this.year = year;
	}
}
