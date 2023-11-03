/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2023, The ComiXed Project
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * <code>ComiXedSecurityConfiguration</code> provides the security configuration for all web-based
 * server access endpoints.
 *
 * @author Darryl L. Pierce
 */
@Configuration
public class ComiXedSecurityConfiguration {
  @Autowired private ComiXedAuthenticationFilter authenticationFilter;
  @Autowired private ComiXedAuthenticationProvider authenticationProvider;
  @Autowired private ComiXedUnauthorizedEntryPoint unauthorizedHandler;

  @Bean
  public AuthenticationManager authenticationManager(
      AuthenticationConfiguration authenticationConfiguration) throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

  /**
   * Provides a security filter chain for the REST APIs.
   *
   * @param http the security builder
   * @return the filter chain
   * @throws Exception if an error occurs
   */
  @Bean
  public SecurityFilterChain restSecurityFilterChain(final HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .authenticationProvider(this.authenticationProvider)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .exceptionHandling(
            exception -> exception.authenticationEntryPoint(this.unauthorizedHandler))
        .securityMatcher("/api/**")
        .authorizeHttpRequests(authz -> authz.anyRequest().permitAll());
    http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  /**
   * Provides a security filter chain for the OPDS APIs.
   *
   * @param http the security builder
   * @return the filter chain
   * @throws Exception if an error occurs
   */
  @Bean
  public SecurityFilterChain opdsSecurityFilterChain(final HttpSecurity http) throws Exception {
    http.securityMatcher("/opds/**")
        .authorizeHttpRequests(authz -> authz.anyRequest().hasRole("READER"))
        .httpBasic(Customizer.withDefaults());
    http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public SecurityFilterChain runtimeSecurityFilterChain(final HttpSecurity http) throws Exception {
    http.securityMatcher("/actuator/**")
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(
            session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
        .exceptionHandling(
            exception -> exception.authenticationEntryPoint(this.unauthorizedHandler))
        .authorizeHttpRequests(authz -> authz.anyRequest().hasRole("ADMIN"));
    http.addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
