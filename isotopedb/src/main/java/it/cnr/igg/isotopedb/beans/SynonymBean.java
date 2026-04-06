package it.cnr.igg.isotopedb.beans;

import java.util.ArrayList;

class Synonym {
	public String name;
	public ArrayList<String> synonyms;
	
	public Synonym(String name, ArrayList<String> synonyms) {
		super();
		this.name = name;
		if (synonyms != null)
			this.synonyms = synonyms;
		else
			this.synonyms = new ArrayList<String>();
	}
	
	public void addSynonym(String s) {
		synonyms.add(s);
	}
}

public class SynonymBean extends TheBean  {
	private ArrayList<Synonym> synonymList;
	
	public SynonymBean() {
		synonymList = new ArrayList<Synonym>();
	}
	
	public void addSynonimItem(Synonym s) {
		synonymList.add(s);
	}
	
	public ArrayList<Synonym> getSynonymList() {
		return synonymList;
	}
}
