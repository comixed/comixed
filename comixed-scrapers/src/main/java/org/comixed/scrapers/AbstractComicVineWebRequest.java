/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixed.scrapers;

import java.text.MessageFormat;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.codehaus.plexus.util.StringUtils;

/**
 * <code>AbstractComicVineWebRequest</code> defines a foundation for creating concrete
 * implementations of {@link WebRequest} that interact with the ComicVine APIs.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public abstract class AbstractComicVineWebRequest extends AbstractWebRequest {
  private static final String COMICVINE_URL_PATTERN =
      "http://comicvine.gamespot.com/api/{0}/?api_key={1}&format=json{2}{3}";

  private static final String FILTER_ARGUMENT = "&filter={0}";
  private static final String FILTER_FORMAT = "{0}:{1}";

  String endpoint;

  Map<String, String> filterset = new HashMap<>();

  Map<String, String> parameterSet = new HashMap<>();

  private String apiKey;

  public AbstractComicVineWebRequest(String endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Adds a filter field to the request.
   *
   * @param name the filter name
   * @param value the filter value
   */
  public void addFilter(String name, String value) {
    log.debug("Adding request filter: {}={}", name, value);
    this.filterset.put(name, value);
  }

  /**
   * Adds a parameter to the request.
   *
   * @param name the parameter name
   * @param value the parameter value
   */
  public void addParameter(String name, String value) {
    log.debug("Adding parameter: {}={}", name, value);
    this.parameterSet.put(name, value);
  }

  protected void checkForMissingRequiredParameter(String required) throws WebRequestException {
    if (!this.parameterSet.containsKey(required))
      throw new WebRequestException("Missing required parameter: " + required);
  }

  @Override
  public String getURL() throws WebRequestException {
    if (this.endpoint == null) throw new WebRequestException("Missing or undefined endpoint");
    if (StringUtils.isEmpty(this.apiKey))
      throw new WebRequestException("Missing or undefined API key");
    log.debug("Generating ComicVine URL");
    StringBuilder parameters = new StringBuilder();
    if (!this.parameterSet.isEmpty()) {
      log.debug("Adding parameters");
      for (Map.Entry<String, String> entry : this.parameterSet.entrySet()) {
        String key = entry.getKey();
        String value = entry.getValue();
        log.debug("Adding parameter: {}={}", key, value);

        parameters.append("&");
        parameters.append(key);
        parameters.append("=");
        parameters.append(value);
      }
    }

    StringBuilder filtering = new StringBuilder();
    if (!this.filterset.isEmpty()) {
      log.debug("Adding filters");
      for (Map.Entry<String, String> entry : this.filterset.entrySet()) {
        String key = entry.getKey();
        String value = entry.getValue();
        log.debug("Adding filter: {}={}", key, value);
        String f = MessageFormat.format(FILTER_FORMAT, key, value);
        if (filtering.length() > 0) {
          filtering.append(",");
        }
        filtering.append(f);
      }
    }

    return MessageFormat.format(
        COMICVINE_URL_PATTERN,
        this.endpoint,
        this.apiKey,
        MessageFormat.format(FILTER_ARGUMENT, filtering.toString()),
        parameters.toString());
  }

  public void setApiKey(String apiKey) {
    this.apiKey = apiKey;
  }
}
