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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.authentication;

import java.io.IOException;
import java.util.Arrays;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.SignatureException;

@Component
public class ComiXedAuthenticationFilter extends OncePerRequestFilter implements
                                         AuthenticationConstants
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private ComiXedUserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException
    {
        String header = request.getHeader(HEADER_STRING);
        String username = null;
        String authToken = null;
        if ((header != null) && header.startsWith(TOKEN_PREFIX))
        {
            authToken = header.replace(TOKEN_PREFIX, "");
            try
            {
                username = this.jwtTokenUtil.getEmailFromToken(authToken);
            }
            catch (IllegalArgumentException e)
            {
                this.logger.error("an error occured during getting username from token", e);
            }
            catch (ExpiredJwtException e)
            {
                this.logger.warn("the token is expired and not valid anymore", e);
            }
            catch (SignatureException e)
            {
                this.logger.error("Authentication Failed. Username or Password not valid.");
            }
        }
        else
        {
            this.logger.warn("couldn't find bearer string, will ignore the header");
        }
        if ((username != null) && (SecurityContextHolder.getContext().getAuthentication() == null))
        {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (this.jwtTokenUtil.validateToken(authToken, userDetails))
            {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails,
                                                                                                             null,
                                                                                                             Arrays.asList(new SimpleGrantedAuthority("ROLE_ADMIN")));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                this.logger.debug("authenticated user " + username + ", setting security context");
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
