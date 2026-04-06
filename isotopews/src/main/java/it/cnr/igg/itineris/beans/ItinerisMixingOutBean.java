package it.cnr.igg.itineris.beans;

class MixItem {
	public String member;
	public String element;
	public Double f;
}

public class ItinerisMixingOutBean {
	public MixItem memberOne;
	public MixItem memberTwo;
	public Double mix;
	
	public ItinerisMixingOutBean() {
		memberOne = new MixItem();
		memberTwo = new MixItem();
		mix = 0d;
	}
	
	public void setMemberOneMember(String member) {
		memberOne.member = member;
	}
	
	public void setMemberTwoMember(String member) {
		memberTwo.member = member;
	}
	
	public void setMemberOneElement(String element) {
		memberOne.element = element;
	}
	
	public void setMemberTwoElement(String element) {
		memberTwo.element = element;
	}
	
	public void setMemberOneF(Double f) {
		memberOne.f = f;
	}
	
	public void setMemberTwoF(Double f) {
		memberTwo.f = f;
	}

}
