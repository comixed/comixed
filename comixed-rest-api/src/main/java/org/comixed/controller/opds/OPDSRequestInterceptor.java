package org.comixed.controller.opds;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Enumeration;
import java.util.Iterator;

@Component
public class OPDSRequestInterceptor extends HandlerInterceptorAdapter
{
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException, ServletException
    {
        String requestRoute = request.getRequestURI()
                .substring(request.getContextPath()
                        .length());
        this.logger.debug("Intercepted request: {}", requestRoute);
        this.logger.debug("Method: {}", request.getMethod());
        this.logger.debug("Remote system: {}:{}", request.getRemoteHost(), request.getRemotePort());
        Enumeration<String> names;

        names = request.getHeaderNames();
        while (names.hasMoreElements())
        {
            String headerName = names.nextElement();
            this.logger.debug("Header[{}]={}", headerName, request.getHeader(headerName));
        }

        names = request.getAttributeNames();
        while (names.hasMoreElements())
        {
            String attrName = names.nextElement();
            this.logger.debug("Attribute[{}]={}", attrName, request.getAttribute(attrName));
        }

        return true;
    }
}
