package it.cnr.igg.isotopedb.tools;

public class GeoCoord {

	public Double minLat;
	public Double minLong;
	public Double maxLat;
	public Double maxLong;
	
	public GeoCoord() {
	}
	
	public GeoCoord(Double minLat, Double minLong, Double maxLat, Double maxLong) {
		this.minLat = minLat;
		this.maxLat = maxLat;
		this.minLong = minLong;
		this.maxLong = maxLong;
	}
}
