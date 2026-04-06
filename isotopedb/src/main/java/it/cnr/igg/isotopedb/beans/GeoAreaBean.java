package it.cnr.igg.isotopedb.beans;

public class GeoAreaBean {
	// EPSG 4326 - WGS84
	private Float topLat, topLon, bottomLat, bottomLon;

	public GeoAreaBean(Float topLat, Float topLon, Float bottomLat, Float bottomLon) {
		this.topLat = topLat;
		this.topLon = topLon;
		this.bottomLat = bottomLat;
		this.bottomLon = bottomLon;
	}

	public Float getTopLat() {
		return topLat;
	}

	public Float getTopLon() {
		return topLon;
	}

	public Float getBottomLat() {
		return bottomLat;
	}

	public Float getBottomLon() {
		return bottomLon;
	}
	
}
