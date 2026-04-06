package it.cnr.igg.rest;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;

import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.ComponentBean;
import it.cnr.igg.isotopedb.beans.ReservoirBean;
import it.cnr.igg.isotopedb.beans.SampleBean;
import it.cnr.igg.isotopedb.beans.SampleFieldBean;
import it.cnr.igg.isotopedb.exceptions.DbException;
import it.cnr.igg.isotopedb.queries.MainQuery;
import it.cnr.igg.isotopedb.queries.ReservoirQuery;
import it.cnr.igg.isotopedb.tools.GeoCoord;
import it.cnr.igg.isotopedb.tools.QueryFilter;
import it.cnr.igg.models.TableSampleBean;

class SampleList {
	public String status;
	public ArrayList<ArrayList<String>> tBody;
}

@Path("")
public class Query extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/query-info")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response querySamplesOpt() {
		return ok("");
	}

	@Path("/query-info")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response querySamples() {
		Gson gson = new Gson();
		try {
			final BufferedReader rd = new BufferedReader(new InputStreamReader(request.getInputStream(), "UTF-8"));

			String line = null;
			final StringBuffer buffer = new StringBuffer(2048);

			while ((line = rd.readLine()) != null) {
				buffer.append(line);
			}
			final String data = buffer.toString();
			LinkedTreeMap payload = gson.fromJson(data, LinkedTreeMap.class);
			ArrayList<QueryFilter> filters = fromJson(payload);
			// long ts = System.currentTimeMillis();
			MainQuery mainQuery = new MainQuery();
			ArrayList<SampleBean> beans = mainQuery.query(filters);
			// System.out.println("Elapsed: " + (System.currentTimeMillis() - ts));
			TableSampleBean tsb = new TableSampleBean();
			tsb.build(beans, true);
			// System.out.println("Elapsed: " + (System.currentTimeMillis() - ts));
//			String json = "";
//			json = gson.toJson(tsb.getBody());
//			
			SampleList out = new SampleList();
			out.status = SUCCESS;
			out.tBody = tsb.getBody();
			return ok(gson.toJson(out));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	private ArrayList<QueryFilter> fromJson(LinkedTreeMap payload) throws DbException {
		ArrayList<QueryFilter> filters = new ArrayList<QueryFilter>();
		LinkedTreeMap authors = (LinkedTreeMap) payload.get("authors");
		LinkedTreeMap polygon = (LinkedTreeMap) payload.get("polygon");
		LinkedTreeMap keywords = (LinkedTreeMap) payload.get("keywords");
		LinkedTreeMap reference = (LinkedTreeMap) payload.get("reference");
		LinkedTreeMap year = (LinkedTreeMap) payload.get("year");
		LinkedTreeMap matrix = (LinkedTreeMap) payload.get("matrix");

		QueryFilter qfAuthors = addAuthors(authors);
		if (qfAuthors != null)
			filters.add(qfAuthors);
		QueryFilter qfKeywords = addKeywords(keywords);
		if (qfKeywords != null)
			filters.add(qfKeywords);

		QueryFilter qfReference = addReference(reference);
		if (qfReference != null)
			filters.add(qfReference);

		QueryFilter qfPolygon = addPolygon(polygon);
		if (qfPolygon != null)
			filters.add(qfPolygon);
		
		QueryFilter qfYear = addYear(year);
		if (qfYear != null)
			filters.add(qfYear);

		QueryFilter qfMatrix = addMatrix(matrix);
		if (qfMatrix != null)
			filters.add(qfMatrix);
		return filters;
	}
	
	private QueryFilter addMatrix(LinkedTreeMap matrix) throws DbException {
		if (matrix == null) {
			return null;
		}
		QueryFilter filter = new QueryFilter();
		String operator = (String) matrix.get("operator");
		Integer matrixId = toInteger("" + (((LinkedTreeMap)matrix.get("matrix")).get("nodeId")));
		filter.setMatrixId(operator, matrixId);
		return filter;
	}
	
	private QueryFilter addYear(LinkedTreeMap year) throws DbException {
		if (year == null) {
			return null;
		}
		QueryFilter filter = new QueryFilter();
		String operator = (String) year.get("operator");
		String temp = (String) year.get("year");
		if (operator == null || temp == null)
			throw new DbException("Bad parameter: year");
		filter.setYear(operator, Integer.parseInt(temp));
		return filter;
	}
	
	private QueryFilter addPolygon(LinkedTreeMap polygon) throws DbException {
		if (polygon == null)
			return null;
		QueryFilter filter = new QueryFilter();
		String operator = (String) polygon.get("operator");
		Double topLat = (Double) polygon.get("topLat");
		Double topLon = (Double) polygon.get("topLon");
		Double bottomLat = (Double) polygon.get("bottomLat");
		Double bottomLon = (Double) polygon.get("bottomLon");
		if (operator == null || topLat == null || topLon == null 
				|| bottomLat == null || bottomLon == null)
			throw new DbException("Bad parameter: polygon");
		filter.setCoordinates(operator, new GeoCoord(
				topLat <= bottomLat ? topLat : bottomLat, 
				topLon <= bottomLon ? topLon : bottomLon, 
				topLat >= bottomLat ? topLat : bottomLat, 
				topLon >= bottomLon ? topLon : bottomLon)); 
		return filter;
	}

	private QueryFilter addReference(LinkedTreeMap reference) throws DbException {
		if (reference == null)
			return null;
		QueryFilter filter = new QueryFilter();
		String operator = (String) reference.get("operator");
		String ref = (String) reference.get("reference");
		if (operator == null || ref == null)
			throw new DbException("Bad parameter: reference");
		filter.setReference(operator, ref);
		return filter;
	}

	private QueryFilter addAuthors(LinkedTreeMap authors) throws DbException {
		if (authors == null)
			return null;
		QueryFilter filter = new QueryFilter();
		String operator = (String) authors.get("operator");
		ArrayList<String> auths = (ArrayList<String>) authors.get("authors");
		if (operator == null || auths == null)
			throw new DbException("Bad parameter: authors");
		ArrayList<String> qfa = new ArrayList<String>();
		for (String auth : auths) {
			qfa.add(auth.trim());
		}
		filter.setAuthors(operator, qfa);
		return filter;
	}

	private QueryFilter addKeywords(LinkedTreeMap keywords) throws DbException {
		if (keywords == null)
			return null;
		QueryFilter filter = new QueryFilter();
		String operator = (String) keywords.get("operator");
		String keys = (String) keywords.get("keywords");
		if (operator == null || keys == null)
			throw new DbException("Bad parameter: keywords");
		ArrayList<String> qfa = new ArrayList<String>();
		String[] ks = keys.split(" ");
		for (String k : ks) {
			qfa.add(k);
		}
		filter.setKeywords(operator, qfa);
		return filter;
	}

	private ArrayList<SampleBean> querySamples(QueryFilter filter) throws Exception, DbException {
		MainQuery mainQuery = new MainQuery();
		ArrayList<SampleBean> beans = mainQuery.query(filter);
		return beans;
	}

}
