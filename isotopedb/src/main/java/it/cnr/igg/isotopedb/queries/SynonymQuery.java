package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;

import it.cnr.igg.isotopedb.beans.SynonymBean;
import it.cnr.igg.isotopedb.exceptions.DbException;

public class SynonymQuery extends Query {
	
	public SynonymQuery() {
		super();
	}
	
	public SynonymBean getSynonyms() throws Exception, DbException  {
		Connection con = null;
		try {
			con = cm.createConnection();
			return getSynonyms(con);
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			cm.closeConnection();
		}
		
	}
	
	
	public SynonymBean getSynonyms(Connection con) throws Exception, DbException  {
		SynonymBean sb = new SynonymBean();
		String query = "get * from synonyms";
		return sb;
	}
}
