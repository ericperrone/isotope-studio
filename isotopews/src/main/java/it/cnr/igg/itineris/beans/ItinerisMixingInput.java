package it.cnr.igg.itineris.beans;

import java.util.ArrayList;

public class ItinerisMixingInput {
	private ArrayList<ItinerisEndMember> endMember1;
	private ArrayList<ItinerisEndMember> endMember2;
	private Double increment = 0.05d;
	
	public ItinerisMixingInput() {
		increment = 0.05d;
	}

	public ArrayList<ItinerisEndMember> getEndMember1() {
		return endMember1;
	}

	public ArrayList<ItinerisEndMember> getEndMember2() {
		return endMember2;
	}

	public Double getIncrement() {
		return increment;
	}

	public void setEndMember1(ArrayList<ItinerisEndMember> endMember1) {
		this.endMember1 = endMember1;
	}

	public void setEndMember2(ArrayList<ItinerisEndMember> endMember2) {
		this.endMember2 = endMember2;
	}

	public void setIncrement(Double increment) {
		this.increment = increment;
	}
}
