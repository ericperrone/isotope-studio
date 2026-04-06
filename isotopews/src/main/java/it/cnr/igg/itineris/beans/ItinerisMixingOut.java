package it.cnr.igg.itineris.beans;

import java.util.ArrayList;

class Point {
	Double x;
	Double y;
}

public class ItinerisMixingOut {
	private ArrayList<ItinerisMixingOutBean> elementOneData;
	private ArrayList<ItinerisMixingOutBean> elementTwoData;
	private ArrayList<Point> points;
	
	public ItinerisMixingOut(ArrayList<ItinerisMixingOutBean> memberOneData,
			ArrayList<ItinerisMixingOutBean> memberTwoData) {
		this.elementOneData = memberOneData;
		this.elementTwoData = memberTwoData;
		setPoints();
	}
	
	private void setPoints() {
		points = new ArrayList<Point>();
		for (int i = 0; i < elementOneData.size(); i++) {
			Point p = new Point();
			p.x = elementOneData.get(i).mix;
			p.y = elementTwoData.get(i).mix;
			points.add(i, p);
		}
	}
}
