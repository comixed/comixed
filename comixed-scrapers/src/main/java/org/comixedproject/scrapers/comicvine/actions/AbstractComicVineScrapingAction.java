/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.comicvine.actions;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.scrapers.actions.AbstractScrapingAction;

/**
 * <code>AbstractComicVineScrapingAction</code> is the foundation on which ComicVine scrapers are
 * built.
 *
 * @author Darryl L. Pierce
 * @param <T>
 */
@Log4j2
public abstract class AbstractComicVineScrapingAction<T> extends AbstractScrapingAction<T> {
  /*
   * {0} is the server hostname (and port)
   * {1} is the endpoint
   * {2} the API key
   * {3} the filters
   * {4] the search parameters
   * {5} the field list
   */
  private static final String COMICVINE_URL_PATTERN_1 =
      "{0}/api/{1}/?api_key={2}&format=json{3}{4}{5}";
  private static final String COMICVINE_URL_PATTERN_2 = "{0}?api_key={1}&format=json{2}{3}{4}";
  protected static final String RESOURCES_PARAMETER = "resources";
  protected static final String QUERY_PARAMETER = "query";
  protected static final String RESULT_LIMIT_PARAMETER = "limit";
  protected static final String PAGE_PARAMETER = "page";
  protected static final String LIMIT_PARAMETER = "limit";
  protected static final String NAME_FILTER = "name";

  private final Map<String, String> filters = new HashMap<>();
  private final Map<String, String> parameters = new HashMap<>();
  private final List<String> fields = new ArrayList<>();

  @Getter @Setter protected String baseUrl;
  @Getter @Setter private String apiKey;
  private String maskedApiKey;

  public AbstractComicVineScrapingAction() {
    this.addParameter(RESULT_LIMIT_PARAMETER, "100");
  }

  /**
   * Sets the page to be returned in a multi-page response set.
   *
   * <p>At ComicVine, pages start with 1.
   *
   * @param page the page
   */
  public void setPage(Integer page) {
    this.parameters.remove("page");
    if (page != null && page > 1) this.parameters.put("page", String.valueOf(page));
  }

  /**
   * Adds a new query filter.
   *
   * @param name the filter name
   * @param value the filter value
   */
  protected void addFilter(final String name, final String value) {
    log.debug("Adding request filter: {}={}", name, value);
    this.filters.put(name, value);
  }

  /**
   * Generates the URL to be used.
   *
   * @param baseUrl the url
   * @return the URL
   */
  protected String createUrl(final String baseUrl) {
    return this.createUrl(baseUrl, null);
  }

  /**
   * Generates the URL to be used.
   *
   * @param baseUrl the url
   * @param endpoint the endpoint
   * @return the URL
   */
  protected String createUrl(final String baseUrl, final String endpoint) {
    String filterText = this.generateFilters();
    String parameterText = this.generateParameters();
    String fieldListText = this.generateFilterList();

    log.debug("Generating the URL: endpoint={}", endpoint);
    if (endpoint != null) {
      return MessageFormat.format(
          COMICVINE_URL_PATTERN_1,
          baseUrl,
          endpoint,
          this.apiKey,
          filterText,
          parameterText,
          fieldListText);
    } else {
      return MessageFormat.format(
          COMICVINE_URL_PATTERN_2, baseUrl, this.apiKey, filterText, parameterText, fieldListText);
    }
  }

  private String generateFilterList() {
    String result = "";

    if (!this.fields.isEmpty()) {
      log.debug("Processing field list");
      StringBuilder builder = new StringBuilder("&field_list=");
      for (int index = 0; index < this.fields.size(); index++) {
        if (index > 0) builder.append(",");
        final String fieldName = this.fields.get(index);
        log.debug("Adding result field: {}", fieldName);
        builder.append(fieldName);
      }
      result = builder.toString();
    }

    return result;
  }

  private String generateParameters() {
    String result = "";

    if (!this.parameters.isEmpty()) {
      log.debug("Processing parameters");
      StringBuilder builder = new StringBuilder();
      for (Map.Entry<String, String> entry : this.parameters.entrySet()) {
        log.debug("Adding parameter: {}={}", entry.getKey(), encode(entry.getValue()));
        builder.append("&").append(entry.getKey()).append("=").append(encode(entry.getValue()));
      }
      result = builder.toString();
    }

    return result;
  }

  private String generateFilters() {
    String result = "";

    if (!this.filters.isEmpty()) {
      log.debug("Processing filters");
      StringBuilder builder = new StringBuilder("&filter=");
      int filterCount = 0;
      for (Map.Entry<String, String> entry : this.filters.entrySet()) {
        if (filterCount++ > 0) builder.append(",");
        log.debug("Adding filter: {}:{}", entry.getKey(), entry.getValue());
        builder.append(entry.getKey() + ":" + encode(entry.getValue()));
      }
      result = builder.toString();
    }

    return result;
  }

  /**
   * Returns a URL encoded value.
   *
   * @param value the input
   * @return the encoded value
   */
  private String encode(final String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }

  /**
   * Adds a new field to be included in the result.
   *
   * @param name the field
   */
  protected void addField(final String name) {
    log.debug("Adding result field: {}", name);
    this.fields.add(name);
  }

  /**
   * Adds a new parameter.
   *
   * @param name the parameter name
   * @param value the parameter value
   */
  protected void addParameter(final String name, final String value) {
    this.parameters.put(name, value);
  }

  /**
   * Returns a masked version of the API key for logging purposes
   *
   * @return the masked key
   */
  protected String getMaskedApiKey() {
    if (this.maskedApiKey == null) {
      final StringBuilder builder = new StringBuilder();
      int length = this.apiKey.length() - 4;
      if (length < 1) length = this.apiKey.length() / 2;
      for (int index = 0; index < length; index++) {
        builder.append("*");
      }
      if (length < this.apiKey.length()) builder.append(this.apiKey.substring(length));
      this.maskedApiKey = builder.toString();
    }
    return this.maskedApiKey;
  }
}
