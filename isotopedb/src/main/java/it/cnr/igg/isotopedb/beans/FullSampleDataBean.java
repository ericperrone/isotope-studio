package it.cnr.igg.isotopedb.beans;

import java.util.ArrayList;

public class FullSampleDataBean {
	ArrayList<SampleDataBean> values;
	String metadata;
	public FullSampleDataBean(ArrayList<SampleDataBean> values, String metadata) {
		this.values = formatData(values);
		this.metadata = metadata;
	}
	
	public ArrayList<SampleDataBean> getValues() {
		return values;
	}
	
	public String getMetadata() {
		return metadata;
	}
	
	private ArrayList<SampleDataBean> formatData(ArrayList<SampleDataBean> list) {
		ArrayList<SampleDataBean> list2 = new ArrayList<SampleDataBean>();
		for (SampleDataBean sdb : list) {
			String type = sdb.getType();

			if (sdb.getName().equalsIgnoreCase("GEOROC_ID"))
				continue;

			if (sdb.getSynonym() != null) {
				sdb.setName(sdb.getSynonym());
				sdb.setSynonym(null);
			}
			
			switch (type) {
			case "C":
				sdb.setType("Chemical element");
				break;
			case "I":
				sdb.setType("Isotope");
				break;
			case "F":
				sdb.setType("Descriptor");
				break;
			}
			list2.add(sdb);
		}
		return list2;
	}
	
	
}
