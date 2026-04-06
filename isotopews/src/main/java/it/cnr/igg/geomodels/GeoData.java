package it.cnr.igg.geomodels;

class Member {
	public String member;
	public String element;
	public double concentration;
	public double concentration2;
	
	public Member(String member, String element, double concentration) {
		this.member = member;
		this.element = element;
		this.concentration = concentration;
		this.concentration2 = 0d;
	}

	public Member(String member, String element, double concentration, double concentration2) {
		this.member = member;
		this.element = element;
		this.concentration = concentration;
		this.concentration2 = concentration2;
	}
}

public class GeoData {
//	private String element;
	private Member[] members;
	private double step;
	private Double plottedX;
	private Double plottedY;
	private Member[] xs;
	private Member[] ys;
	
	public GeoData() {
	}

	public GeoData(Member[] members) {
		super();
//		this.element = element;
		this.members = members;
	}

	public Member[] getMembers() {
		return members;
	}
	
	public double getStep() {
		return step;
	}

	public void setMembers(Member[] members) {
		this.members = members;
	}
	
	public void setMembers(int size) {
		this.members = new Member[size];
	}
	
	public void setXYs(int size) {
		this.xs = new Member[size];
		this.ys = new Member[size];
	}
	
	public void setMember(String member, String element, Double concentration, int index) {
		this.members[index] = new Member(member, element, concentration);
	}
	
	public void setStep(double step) {
		this.step = step;
	}

	public void setMember(String member, String element, Double concentration, Double concentration2, int index) {
		this.members[index] = new Member(member, element, concentration, concentration2);
	}

	public Double getPlottedX() {
		return plottedX;
	}

	public Double getPlottedY() {
		return plottedY;
	}

	public void setPlottedX(Double plottedX) {
		this.plottedX = plottedX;
	}

	public void setPlottedY(Double plottedY) {
		this.plottedY = plottedY;
	}

	public Member[] getXs() {
		return xs;
	}

	public Member[] getYs() {
		return ys;
	}

	public void setXs(Member[] xs) {
		this.xs = xs;
	}

	public void setYs(Member[] ys) {
		this.ys = ys;
	}
	
	public void addXs(String member, String element, double concentration, double concentration2, int position) {
		xs[position] = new Member(member, element, concentration, concentration2);
	}
	
	public void addYs(String member, String element, double concentration, double concentration2, int position) {
		ys[position] = new Member(member, element, concentration, concentration2);
	}	
}
