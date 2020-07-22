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

package org.comixedproject.plugins.model;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Map;
import java.util.Properties;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.interpreters.PluginInterpreterLoader;
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

  private PluginDescriptor descriptor;

  /**
   * Executes the plugin.
   *
   * @throws PluginException if an error occurs
   */
  void execute() throws PluginException {}

  public String getLanguage() {
    return this.descriptor.getLanguage();
  }

  public String getName() {
    return this.descriptor.getName();
  }

  public String getVersion() {
    return this.descriptor.getVersion();
  }

  public String getDescription() {
    return this.descriptor.getDescription();
  }

  public String getAuthor() {
    return this.descriptor.getAuthor();
  }

  public Map<String, byte[]> getEntries() {
    return this.descriptor.getEntries();
  }

  /**
   * Sets the file entries for the plugin.
   *
   * @param entries the file entries
   * @throws PluginException if an error occurs
   */
  public void setEntries(Map<String, byte[]> entries) throws PluginException {
    this.descriptor = new PluginDescriptor(this);
    this.descriptor.setEntries(entries);

    byte[] content = entries.get(MANIFEST_FILENAME);
    if (content == null || content.length == 0)
      throw new PluginException("Missing plugin manifest file");
    log.debug("loading plugin manifest file");
    Properties properties = new Properties();
    try {
      properties.load(new ByteArrayInputStream(content));
    } catch (IOException error) {
      throw new PluginException("could not read plugin manifest file", error);
    }
    this.descriptor.setLanguage((String) properties.get(PLUGIN_LANGUAGE));
    if (StringUtils.isEmpty(this.descriptor.getLanguage()))
      throw new PluginException("plugin must declare a language");
    if (!this.interpreterLoader.hasLanguage(this.descriptor.getLanguage()))
      throw new PluginException("plugin language not supported: " + this.descriptor.getLanguage());
    this.descriptor.setName((String) properties.get(PLUGIN_NAME));
    if (StringUtils.isEmpty(this.descriptor.getName()))
      throw new PluginException("plugin must have a name");
    this.descriptor.setVersion((String) properties.getOrDefault(PLUGIN_VERSION, "unknown"));
    this.descriptor.setDescription(
        (String) properties.getOrDefault(PLUGIN_DESCRIPTION, "No description"));
    this.descriptor.setAuthor((String) properties.getOrDefault(PLUGIN_AUTHOR, "anonymous"));
  }

  /**
   * Creates a {@link PluginDescriptor} for the plugin.
   *
   * @return the descriptor
   */
  public PluginDescriptor getDescriptor() {
    return this.descriptor;
  }
}
