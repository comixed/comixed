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
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * <code>ComiXedRESTSecurityConfiguration</code> defines the web security configuration for the REST
 * system.
 *
 * @author Darryl L. Pierce
 */
@Configuration
@ComponentScan({"org.comixedproject.rest", "org.comixedproject.http", "org.comixedproject.auth"})
@Log4j2
@Order(2)
public class ComiXedRESTSecurityConfiguration extends WebSecurityConfigurerAdapter {
  @Autowired private ComiXedUnauthorizedEntryPoint unauthorizedHandler;
  @Autowired private ComiXedAuthenticationFilter authenticationFilter;
  @Autowired private ComiXedAuthenticationProvider authenticationProvider;

  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(authenticationProvider);
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http.antMatcher("/api/token/generate")
        .cors()
        .and()
        .csrf()
        .disable()
        .authorizeRequests()
        .and()
        .requestMatchers()
        .and()
        .antMatcher("/api/**")
        .cors()
        .and()
        .csrf()
        .disable()
        .authorizeRequests()
        .anyRequest()
        .permitAll()
        .and()
        .exceptionHandling()
        .authenticationEntryPoint(unauthorizedHandler)
        .and()
        .sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED);
    http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
  }
}
