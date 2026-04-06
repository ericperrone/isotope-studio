package it.cnr.igg.itineris.beans;

import java.util.ArrayList;

class TernaryElement {
	public String element;
	ArrayList<Double> value;
}

public class ItinerisTernaryInputBean {
	public TernaryElement a;
	public TernaryElement b;
	public TernaryElement c;
	
	public ItinerisTernaryInputBean() {
		a = new TernaryElement();
		b = new TernaryElement();
		c = new TernaryElement();
	}
	
	public void setA(String element, ArrayList<Double> value) {
		a.element = element;
		a.value = value;
	}
	
	public void setB(String element, ArrayList<Double> value) {
		b.element = element;
		b.value = value;
	}
	
	public void setC(String element, ArrayList<Double> value) {
		c.element = element;
		c.value = value;
	}
	
	public String getElementA() {
		return a.element;
	}
	
	public ArrayList<Double> getValuesA() {
		return a.value;
	}

	public String getElementB() {
		return b.element;
	}
	
	public ArrayList<Double> getValuesB() {
		return b.value;
	}

	public String getElementC() {
		return c.element;
	}

	public ArrayList<Double> getValuesC() {
		return c.value;
	}
}
