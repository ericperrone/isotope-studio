package it.cnr.igg.isotopedb.beans;

public class AdministratorBean extends TheBean {
	private Long id;
	private String account;
	private String password;
	private String key;
	private boolean active;
	private String email;

	public AdministratorBean(String account, String password, String email) {
		super();
		this.account = account;
		this.password = password;
		this.email = email;
		this.active = true;
	}
	
	public AdministratorBean(Long id, String account, String email, boolean active) {
		super();
		this.id = id;
		this.account = account;
		this.password = password;
		this.email = email;
		this.active = active;
	}

	public AdministratorBean(Long id, String account, String password, String key, boolean active, String email) {
		super();
		this.id = id;
		this.account = account;
		this.password = password;
		this.key = key;
		this.active = active;
		this.email = email;
	}

	public Long getId() {
		return id;
	}

	public String getAccount() {
		return account;
	}

	public String getPassword() {
		return password;
	}

	public String getKey() {
		return key;
	}

	public boolean isActive() {
		return active;
	}

	public String getEmail() {
		return email;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public void setAccount(String account) {
		this.account = account;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
