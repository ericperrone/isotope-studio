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
import it.cnr.igg.isotopedb.beans.ElementBean;
import it.cnr.igg.isotopedb.queries.ElementQuery;

@Path("")
public class Element extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/insert-element")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertElementOpt() {
		return ok("");
	}

	@Path("/insert-element")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertElement() {
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
			ElementBean bean = new ElementBean("" + payload.get("element"),
					("" + payload.get("isotope")).equalsIgnoreCase("true") ? true : false,
					payload.get("group") == null ? null : "" + payload.get("group"));
			ElementQuery eq = new ElementQuery();
			eq.insert(bean);
			return ok();
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/get-elements")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getElementsOpt() {
		return ok("");
	}

	@Path("/get-elements")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAuthors() {
		String json = "";
		Gson gson = new Gson();
		try {
			ElementQuery eq = new ElementQuery();
			ArrayList<ElementBean> beans = eq.getAll();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

}
