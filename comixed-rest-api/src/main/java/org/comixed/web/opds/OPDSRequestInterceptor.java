package org.comixed.web.opds;

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
        logger.debug("Intercepted request: {}", requestRoute);
        logger.debug("Method: {}", request.getMethod());
        logger.debug("Remote system: {}@{}:{}", request.getRemoteUser(), request.getRemoteHost(), request.getRemotePort());

        return true;
    }
}
