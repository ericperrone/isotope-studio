package it.cnr.igg.itineris.beans;

public class ItinerisReferenceBean {
	private String reference;
	private String metadata;
	
	public ItinerisReferenceBean(String reference, String metadata) {
		super();
		this.reference = reference;
		this.metadata = metadata;
	}

	public String getReference() {
		return reference;
	}

	public String getMetadata() {
		return metadata;
	}
}
