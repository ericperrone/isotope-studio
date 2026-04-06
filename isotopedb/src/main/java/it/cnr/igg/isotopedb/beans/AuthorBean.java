package it.cnr.igg.isotopedb.beans;

public class AuthorBean extends TheBean {
	private Long id;
	private String name, surname;
	
	public AuthorBean(String name, String surname) {
		super();
		this.name = name;
		this.surname = surname;
	}

	public AuthorBean(Long id, String name, String surname) {
		super();
		this.id = id;
		this.name = name;
		this.surname = surname;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getSurname() {
		return surname;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setName(String name) {
		this.name = name;
	}

	public void setSurname(String surname) {
		this.surname = surname;
	}
	
	@Override
	public String toString() {
		return surname + " " + name;
	}

}
