package it.cnr.igg.rest;

import java.util.ArrayList;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.google.gson.Gson;

import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.MatrixBean;
import it.cnr.igg.isotopedb.queries.MatrixQuery;

@Path("")
public class Matrix extends ResultBuilder {

	@Path("/matrix")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getMatricesOpt() {
		return ok("");
	}
	
	@Path("/matrix")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getMatrices(@QueryParam("ids") String ids) {
		try {
			MatrixQuery query = new MatrixQuery();
			ArrayList<MatrixBean> beans = query.getAll();

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	@Path("/matrix/roots")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getRoots() {
		try {
			MatrixQuery query = new MatrixQuery();
			ArrayList<MatrixBean> beans = query.getRoots();

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	@Path("/matrix/children")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getChildren(@QueryParam("nodeid") String nodeid) {
		try {
			MatrixQuery query = new MatrixQuery();
			ArrayList<MatrixBean> beans = query.getChildren(Integer.valueOf(nodeid));

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	@Path("/matrix/node")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getParent(@QueryParam("nodeid") String nodeid) {
		try {
			MatrixQuery query = new MatrixQuery();
			MatrixBean bean = query.getNode(Integer.valueOf(nodeid));

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(bean);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	
	@Path("/matrix/ancestor")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAncestor(@QueryParam("nodeid") String nodeid) {
		try {
			MatrixQuery query = new MatrixQuery();
			ArrayList<MatrixBean> beans = query.getAncestor(Integer.valueOf(nodeid));

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
	
	@Path("/matrix/tree")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTree(@QueryParam("nodeid") String nodeid) {
		try {
			MatrixQuery query = new MatrixQuery();
			ArrayList<MatrixBean> beans = query.getTree(Integer.valueOf(nodeid));

			String json = "";
			Gson gson = new Gson();
			json = gson.toJson(beans);
			return ok(json);
		} catch (Exception ex) {
			return error(ex.getMessage());
		}
	}
}
