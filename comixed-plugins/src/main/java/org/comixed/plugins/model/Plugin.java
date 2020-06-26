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

package org.comixed.plugins.model;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import lombok.extern.log4j.Log4j2;
import org.comixed.plugins.PluginException;
import org.comixed.plugins.interpreters.PluginInterpreterLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

/**
 * <code>Plugin</code> represents the context for a single plugin.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class Plugin {
  public static final String MANIFEST_FILENAME = "plugin.properties";
  public static final String PLUGIN_LANGUAGE = "language";
  public static final String PLUGIN_NAME = "name";
  public static final String PLUGIN_VERSION = "version";
  public static final String PLUGIN_DESCRIPTION = "description";
  public static final String PLUGIN_AUTHOR = "author";

  @Autowired private PluginInterpreterLoader interpreterLoader;

  private Map<String, byte[]> entries = new HashMap<>();
  private String language;
  private String name;
  private String version;
  private String description;
  private String author;

  /**
   * Executes the plugin.
   *
   * @throws PluginException if an error occurs
   */
  void execute() throws PluginException {}

  public String getLanguage() {
    return language;
  }

  public String getName() {
    return name;
  }

  public String getVersion() {
    return version;
  }

  public String getDescription() {
    return description;
  }

  public String getAuthor() {
    return author;
  }

  public Map<String, byte[]> getEntries() {
    return entries;
  }

  /**
   * Sets the file entries for the plugin.
   *
   * @param entries the file entries
   * @throws PluginException if an error occurs
   */
  public void setEntries(Map<String, byte[]> entries) throws PluginException {
    this.entries = entries;
    byte[] content = this.entries.get(MANIFEST_FILENAME);
    if (content == null || content.length == 0)
      throw new PluginException("Missing plugin manifest file");
    log.debug("loading plugin manifest file");
    Properties properties = new Properties();
    try {
      properties.load(new ByteArrayInputStream(content));
    } catch (IOException error) {
      throw new PluginException("could not read plugin manifest file", error);
    }
    this.language = (String) properties.get(PLUGIN_LANGUAGE);
    if (StringUtils.isEmpty(this.language))
      throw new PluginException("plugin must declare a language");
    if (!this.interpreterLoader.hasLanguage(this.language))
      throw new PluginException("plugin language not supported: " + this.language);
    this.name = (String) properties.get(PLUGIN_NAME);
    if (StringUtils.isEmpty(this.name)) throw new PluginException("plugin must have a name");
    this.version = (String) properties.getOrDefault(PLUGIN_VERSION, "unknown");
    this.description = (String) properties.getOrDefault(PLUGIN_DESCRIPTION, "No description");
    this.author = (String) properties.getOrDefault(PLUGIN_AUTHOR, "anonymous");
    this.entries = entries;
  }
}
