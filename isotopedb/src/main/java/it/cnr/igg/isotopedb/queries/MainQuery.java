package it.cnr.igg.isotopedb.queries;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Set;
import java.util.Iterator;

import com.google.gson.internal.LinkedTreeMap;

import java.util.ArrayList;
import java.util.HashMap;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.exceptions.NoDatasetFoundException;
import it.cnr.igg.isotopedb.tools.QueryFilter;

import it.cnr.igg.isotopedb.beans.SampleBean;
import it.cnr.igg.isotopedb.beans.SampleFieldBean;
import it.cnr.igg.isotopedb.beans.ComponentBean;
import it.cnr.igg.isotopedb.tools.QueryFilter;
import it.cnr.igg.isotopedb.tools.QueryFilterItem;
import it.cnr.igg.isotopedb.beans.DatasetBean;
import it.cnr.igg.isotopedb.queries.DatasetQuery;

public class MainQuery extends Query {
	private boolean authors = false, year = false, reference = false, keywords = false;

	public MainQuery() {
		super();
	}

	public ArrayList<SampleBean> query(ArrayList<QueryFilter> filters) throws Exception, DbException {
		ArrayList<SampleBean> beans = new ArrayList<SampleBean>();
		Connection con = null;
		try {
			con = cm.createConnection();
			QueryFilter queryFilter = new QueryFilter();
			queryFilter.datasets = new ArrayList<QueryFilterItem>();
			checkDatasetFilters(filters);
			if (authors == true)
				try {
					ArrayList<QueryFilterItem> items = (new DatasetQuery()).findDatasetByAuthorList(filters, con);
					for (QueryFilterItem item : items)
						queryFilter.datasets.add(item);
				} catch (Exception x) {
					// x.printStackTrace();
					// do nothing
				}
			if (year == true)
				try {
					ArrayList<QueryFilterItem> items = (new DatasetQuery().findDatasetByYear(filters, con));
					for (QueryFilterItem item : items)
						queryFilter.datasets.add(item);

				} catch (Exception x) {
					// x.printStackTrace();
					// do nothing
				}
			if (reference == true)
				try {
					ArrayList<QueryFilterItem> items = (new DatasetQuery().findDatasetByReference(filters, con));
					for (QueryFilterItem item : items)
						queryFilter.datasets.add(item);
				} catch (Exception x) {
					// x.printStackTrace();
					// do nothing
				}
			if (keywords == true)
				try {
					ArrayList<QueryFilterItem> items = (new DatasetQuery().findDatasetByKeywords(filters, con));
					for (QueryFilterItem item : items)
						queryFilter.datasets.add(item);
				} catch (Exception x) {
					// x.printStackTrace();
					// do nothing
				}
			filters = dropDatasetFilters(filters);
			if (queryFilter.datasets.size() > 0)
				filters.add(queryFilter);
			beans = (new SampleQuery()).querySampleInfo(filters, con);
		} catch (NoDatasetFoundException e) {
			filters = dropDatasetFilters(filters);
			beans = (new SampleQuery()).querySampleInfo(filters, con);
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			cm.closeConnection();
		}
		return beans;
	}

	public ArrayList<SampleBean> query(QueryFilter queryFilter) throws Exception, DbException {
		ArrayList<SampleBean> beans = new ArrayList<SampleBean>();
		Connection con = null;
		try {
			con = cm.createConnection();
			queryFilter.datasets = (new DatasetQuery()).queryDatasets(queryFilter, con);
			beans = (new SampleQuery()).querySamples(queryFilter, con);
			return beans;
		} catch (Exception e) {
			e.printStackTrace();
			throw new DbException(e);
		} finally {
			cm.closeConnection();
		}
	}

	private void checkDatasetFilters(ArrayList<QueryFilter> filters) {
		for (QueryFilter f : filters) {
			if (f.authors != null)
				authors = true;
			if (f.keywords != null)
				keywords = true;
			if (f.reference != null)
				reference = true;
			if (f.year != null)
				year = true;
		}
	}

	private ArrayList<QueryFilter> dropDatasetFilters(ArrayList<QueryFilter> filters) {
		ArrayList<QueryFilter> nfilters = new ArrayList<QueryFilter>();
		for (QueryFilter f : filters) {
			if (f.authors != null || f.keywords != null || f.reference != null || f.year != null)
				continue;
			nfilters.add(f);
		}
		return nfilters;
	}
}
