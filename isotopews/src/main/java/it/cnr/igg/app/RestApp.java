package it.cnr.igg.app;

import javax.ws.rs.ApplicationPath;
import org.glassfish.jersey.server.ResourceConfig;
import it.cnr.igg.app.filters.*;


@ApplicationPath("/")
public class RestApp extends ResourceConfig {

	public RestApp() {
		final ResourceConfig resourceConfig = new ResourceConfig();
		resourceConfig.register(new CORSFilter());
	}

}
