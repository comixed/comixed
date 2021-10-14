/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project
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

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * <code>ComiXedOPDSSecurityConfiguration</code> defines the web security configuration for the OPDS
 * system.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@ComponentScan({"org.comixedproject.opds", "org.comixedproject.auth"})
@Log4j2
@Order(1)
public class ComiXedOPDSSecurityConfiguration extends WebSecurityConfigurerAdapter {
  @Autowired private ComiXedAuthenticationFilter authenticationFilter;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.requestMatchers()
        .antMatchers("/opds/**")
        .and()
        .authorizeRequests()
        .anyRequest()
        .hasRole("READER")
        .and()
        .httpBasic();
    http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
  }
}
