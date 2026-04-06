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

import it.cnr.igg.helper.Commons;
import it.cnr.igg.helper.RestResult;
import it.cnr.igg.helper.ResultBuilder;
import it.cnr.igg.isotopedb.beans.AdministratorBean;
import it.cnr.igg.isotopedb.queries.AdministratorQuery;

class AccessKey {
	public String status;
	public String key;
}

class ChangePassword {
	public String status;
}

class AdministratorList {
	public String status;
	public ArrayList<AdministratorBean> list;
}

class NewAdministrator {
	public String status;
	public AdministratorBean administrator;	
}

@Path("")
public class Administrator extends ResultBuilder {
	@Context
	private HttpServletRequest request;

	@Path("/getAdministrators")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAdministratorOpt() {
		return ok("");
	}

	@Path("/getAdministrators")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAdministrator(@QueryParam("account") String account) {
		AdministratorQuery aQuery = new AdministratorQuery();
		Gson gson = new Gson();
		try {
			AdministratorList list = new AdministratorList();
			String key = Commons.getKeyFromHeader(request);
			aQuery.checkKey(key);
			list.list = aQuery.getAdministrators(account);
			list.status = "success";
			return ok(gson.toJson(list));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/enable")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response enableOpt() {
		return ok("");
	}
	
	@Path("/enable")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response enable() {
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
			String account = "" + payload.get("account");
			AdministratorQuery aq = new AdministratorQuery();
			String key = Commons.getKeyFromHeader(request);
			aq.checkKey(key);
			aq.enable(account);
			ChangePassword cp = new ChangePassword();
			cp.status = "success";
			return ok(gson.toJson(cp));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/disable")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response disableOpt() {
		return ok("");
	}
	
	@Path("/disable")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response disable() {
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
			String account = "" + payload.get("account");
			AdministratorQuery aq = new AdministratorQuery();
			String key = Commons.getKeyFromHeader(request);
			aq.checkKey(key);
			aq.disable(account);
			ChangePassword cp = new ChangePassword();
			cp.status = "success";
			return ok(gson.toJson(cp));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/changePassword")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response changePasswordOpt() {
		return ok("");
	}

	@Path("/changePassword")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response changePassword() {
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
			String account = "" + payload.get("account");
			String password = "" + payload.get("password");
			String oldPassword = "" + payload.get("oldpassword");
			AdministratorQuery aq = new AdministratorQuery();
			String key = Commons.getKeyFromHeader(request);
			aq.checkKey(key);
			aq.changePassword(account, oldPassword, password);
			ChangePassword cp = new ChangePassword();
			cp.status = "success";
			return ok(gson.toJson(cp));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/insertAdministrator")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insertOpt() {
		return ok("");
	}

	@Path("/insertAdministrator")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response insert() {
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
			AdministratorBean bean = getAdministratorBean((LinkedTreeMap) payload.get("data"));
			AdministratorQuery aq = new AdministratorQuery();
			bean = aq.putAdministrator(bean);
			NewAdministrator na = new NewAdministrator();
			na.status = "success";
			na.administrator = bean;
			return ok(gson.toJson(na));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}

	@Path("/login")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response loginOpt() {
		return ok("");
	}

	@Path("/login")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response login() {
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
			AdministratorBean bean = getAdministratorBean((LinkedTreeMap) payload.get("data"));

			AdministratorQuery aq = new AdministratorQuery();
			String token = aq.login(bean);
			AccessKey key = new AccessKey();
			key.status = "success";
			key.key = token;
			return ok(gson.toJson(key));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}
	
	@Path("/genkey")
	@OPTIONS
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response genKeyOpt() {
		return ok("");
	}	

	@Path("/genkey")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)	
	public Response generateKey() {
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
			String partner = (String) payload.get("partner");
			AdministratorQuery aq = new AdministratorQuery();
			String key = aq.generateItinerisAccessKey(partner);
			AccessKey ak = new AccessKey();
			ak.status = "success";
			ak.key = key;
			return ok(gson.toJson(ak));
		} catch (Exception x) {
			return error(gson.toJson(RestResult.resultError("" + x.getMessage())));
		}
	}	
	
	private AdministratorBean getAdministratorBean(LinkedTreeMap data) {
		String account = "" + data.get("account");
		String password = "" + data.get("password");
		String email = "" + data.get("email");
		return new AdministratorBean(account, password, email);
	}

}
