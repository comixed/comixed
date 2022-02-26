/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses>
 */

package org.comixedproject.auth;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * <code>ComiXedMvcWebConfiguration</code> provides an MVC runtime configuration.
 *
 * @author Darryl L. Pierce
 */
@Configuration
public class ComiXedMvcWebConfiguration implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(final CorsRegistry registry) {
    registry.addMapping("/opds/**").allowedOriginPatterns("*").allowCredentials(true);
  }

  @Override
  public void addResourceHandlers(final ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/*")
        .addResourceLocations("classpath:/static/")
        .resourceChain(true)
        .addResolver(
            new PathResourceResolver() {
              @Override
              protected Resource getResource(final String resourcePath, final Resource location)
                  throws IOException {
                Resource requestedResource = location.createRelative(resourcePath);
                return requestedResource.exists() && requestedResource.isReadable()
                    ? requestedResource
                    : new ClassPathResource("/static/index.html");
              }
            });
  }
}
