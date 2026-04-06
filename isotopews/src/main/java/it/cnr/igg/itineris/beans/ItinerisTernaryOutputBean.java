package it.cnr.igg.itineris.beans;

import java.util.ArrayList;

public class ItinerisTernaryOutputBean {
	private ItinerisTernaryInputBean initialData;
	private ArrayList<ItinerisPoint> coordinates;
	
	public ItinerisTernaryOutputBean(ItinerisTernaryInputBean initialData) {
		this.initialData = initialData;
		coordinates = new ArrayList<ItinerisPoint>();
	}

	public ItinerisTernaryInputBean getInitialData() {
		return initialData;
	}

	public void setInitialData(ItinerisTernaryInputBean initialData) {
		this.initialData = initialData;
	}

	public ArrayList<ItinerisPoint> getCoordinates() {
		return coordinates;
	}

	public void setCoordinates(ArrayList<ItinerisPoint> coordinates) {
		this.coordinates = coordinates;
	}
	
	public void addPoint(Double x, Double y) {
		coordinates.add(new ItinerisPoint(x, y));
	}
}
