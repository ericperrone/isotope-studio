package it.cnr.igg.isotopedb.queries;

import it.cnr.igg.isotopedb.connection.ConnectionManager;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class Query {
	ConnectionManager cm = null;
	public Query() {
		cm = new ConnectionManager();
	}
}
