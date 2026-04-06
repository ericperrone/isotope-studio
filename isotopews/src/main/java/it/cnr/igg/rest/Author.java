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
import it.cnr.igg.isotopedb.beans.AuthorBean;
import it.cnr.igg.isotopedb.queries.AuthorQuery;

@Path("")
public class Author extends ResultBuilder {

	@Context
	private HttpServletRequest request;

	@Path("/insert-author")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertAuthorOpt() {
		return ok("");
	}

	@Path("/insert-author")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertAuthor() {
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
			AuthorBean bean = new AuthorBean("" + payload.get("name"), "" + payload.get("surname"));
			AuthorQuery authQuery = new AuthorQuery();
			bean = authQuery.insert(bean);
			return ok(gson.toJson(RestResult.resultOk("" + gson.toJson(bean))));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/get-authors")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAuthorsOpt() {
		return ok("");
	}

	@Path("/get-authors")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAuthors(@QueryParam("surname") String surname, @QueryParam("name") String name) {
		try {
			String json = "";
			Gson gson = new Gson();

			if (surname == null || surname.length() <= 0) {
				AuthorQuery authorQuery = new AuthorQuery();
				ArrayList<AuthorBean> authors = authorQuery.getAuthors(null);
				json = gson.toJson(authors);
				// json = gson.toJson(new ArrayList<AuthorBean>());
			} else {
				AuthorQuery authorQuery = new AuthorQuery();
				ArrayList<AuthorBean> authors = authorQuery.getAuthors(new AuthorBean(name, surname));
				json = gson.toJson(authors);
			}
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}

}
