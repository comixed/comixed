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

package org.comixed.plugins;

import java.io.*;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.comixed.plugins.model.Plugin;
import org.comixed.utils.FileTypeIdentifier;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * <code>PluginManager</code> handles retrieving and launching the plugins.
 *
 * @author Darryl L. Pierce
 */
@Component
@EnableConfigurationProperties
@Log4j2
public class PluginManager implements InitializingBean {
  @Autowired private ObjectFactory<Plugin> pluginObjectFactory;
  @Autowired private FileTypeIdentifier fileTypeIdentifier;

  @Value("${comixed.plugins.location}")
  String pluginLocation;

  /** the key is the plugin name, the value is a map of a plugin filename to the file's contents */
  Map<String, Map<String, byte[]>> plugins = new HashMap<>();

  /**
   * Returns a {@link Plugin} by name.
   *
   * @param name the plugin name
   * @return the plugin's classname
   * @throws PluginException if an error occurs retrieve the plugin
   */
  public Plugin loadPlugin(String name) throws PluginException {
    log.debug("Loading plugin details");
    Map<String, byte[]> pluginEntries = this.plugins.get(name);
    if (pluginEntries == null) throw new PluginException("no such plugin: " + name);
    log.debug("Rehydrating plugin");
    Plugin result = this.pluginObjectFactory.getObject();
    result.setEntries(pluginEntries);
    return result;
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.debug("initial loading of plugins");
    this.loadPlugins();
  }

  public void loadPlugins() throws PluginException {
    log.debug("Clearing plugin list");
    this.plugins.clear();
    File pluginDirectory = new File(this.pluginLocation);
    if (!pluginDirectory.exists()) {
      log.debug("Plugin directory does not exist: {}", pluginDirectory.getAbsolutePath());
      return;
    }
    if (!pluginDirectory.isDirectory())
      throw new PluginException("Not a directory: " + this.pluginLocation);

    Collection<File> pluginFiles =
        FileUtils.listFiles(pluginDirectory, new String[] {"cxp"}, false);
    log.debug("Found {} file{} to process", pluginFiles.size(), pluginFiles.size() == 1 ? "" : "s");
    int processed = 0;
    for (File pluginFile : pluginFiles) {
      try (InputStream input = new BufferedInputStream(new FileInputStream(pluginFile))) {
        String fileType = this.fileTypeIdentifier.subtypeFor(input);
        if (!fileType.equalsIgnoreCase("zip")) {
          log.debug("{} is not a zip file; skipping", pluginFile.getName());
        } else {
          this.loadPluginDetails(pluginFile);
          processed++;
        }
      } catch (IOException error) {
        log.error("could not determine file type: " + pluginFile.getAbsolutePath());
      }
    }

    log.debug("Processed {} plugin{}", processed, processed == 1 ? "" : "s");
  }

  private void loadPluginDetails(File pluginFile) throws PluginException {
    log.debug("Loading plugin file: {}", pluginFile.getAbsolutePath());
    if (!pluginFile.exists())
      throw new PluginException("No such plugin file: " + pluginFile.getAbsolutePath());
    if (!pluginFile.isFile())
      throw new PluginException("Plugin points to directory: " + pluginFile.getAbsolutePath());

    Map<String, byte[]> pluginEntries = new HashMap<>();

    log.debug("opening archive");
    try (ZipFile zipfile = new ZipFile(pluginFile); ) {
      log.debug("retrieving the list of archive entries");
      Enumeration<ZipArchiveEntry> zipfileEntries = zipfile.getEntries();
      while (zipfileEntries.hasMoreElements()) {
        ZipArchiveEntry zipfileEntry = zipfileEntries.nextElement();
        String filename = zipfileEntry.getName();
        long filesize = zipfileEntry.getSize();
        byte[] content = new byte[(int) filesize];
        log.debug("Loading plugin file: {} ({} bytes)", filename, filesize);
        IOUtils.readFully(zipfile.getInputStream(zipfileEntry), content);
        pluginEntries.put(filename, content);
      }
    } catch (IOException error) {
      throw new PluginException("failed to load plugin: " + pluginFile.getName(), error);
    }

    log.debug("storing plugin details");
    Plugin plugin = this.pluginObjectFactory.getObject();
    plugin.setEntries(pluginEntries);
    if (this.plugins.containsKey(plugin.getName()))
      throw new PluginException("plugin already exists with name: " + plugin.getName());
    this.plugins.put(plugin.getName(), pluginEntries);
  }
}
