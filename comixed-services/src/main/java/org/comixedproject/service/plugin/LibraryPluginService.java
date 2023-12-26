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

package org.comixedproject.service.plugin;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.model.plugin.LibraryPluginProperty;
import org.comixedproject.model.user.ComiXedUser;
import org.comixedproject.plugins.PluginRuntime;
import org.comixedproject.plugins.PluginRuntimeException;
import org.comixedproject.plugins.PluginRuntimeRegistry;
import org.comixedproject.repositories.plugin.LibraryPluginRepository;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.comixedproject.service.lists.ReadingListService;
import org.comixedproject.service.user.ComiXedUserException;
import org.comixedproject.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>LibraryPluginService</code> provides methods for working with instances of {@link
 * LibraryPlugin}
 */
@Service
@Log4j2
public class LibraryPluginService {
  public static final String PROPERTY_NAME_LOG = "log";
  public static final String PROPERTY_NAME_COMIC_BOOK_SERVICE = "comicBookService";
  public static final String PROPERTY_NAME_READING_LIST_SERVICE = "readingListService";
  @Autowired private LibraryPluginRepository libraryPluginRepository;
  @Autowired private UserService userService;
  @Autowired private PluginRuntimeRegistry pluginRuntimeRegistry;

  // the following are provided to the plugin runtime and are not used by this service
  @Autowired private ComicBookService comicBookService;
  @Autowired private ReadingListService readingListService;

  /**
   * Returns the list of all configured plugins.
   *
   * @param email the user's email
   * @return the plugin list
   * @throws LibraryPluginException if an error occurs
   */
  public List<LibraryPlugin> getAllPlugins(final String email) throws LibraryPluginException {
    log.debug("Loading user: {}", email);
    try {
      final ComiXedUser user = this.userService.findByEmail(email);
      log.debug("Loading {} plugins", user.isAdmin() ? "all" : "non-admin");
      return this.libraryPluginRepository.getAll().stream()
          .filter(plugin -> user.isAdmin() || !plugin.getAdminOnly())
          .toList();
    } catch (ComiXedUserException error) {
      throw new LibraryPluginException("Failed to load all plugins", error);
    }
  }

  /**
   * Creates a new plugin record.
   *
   * @param pluginLanguage the language
   * @param pluginFilename the plugin
   * @return the saved plugin
   * @throws LibraryPluginException if an error occurs
   */
  @Transactional
  public LibraryPlugin createPlugin(final String pluginLanguage, final String pluginFilename)
      throws LibraryPluginException {
    try {
      log.debug("Loading libraryPlugin language runtime: {}", pluginLanguage);
      final PluginRuntime pluginRuntime =
          this.pluginRuntimeRegistry.getPluginRuntime(pluginLanguage);
      log.trace("Getting libraryPlugin name");
      final String name = pluginRuntime.getName(pluginFilename);
      log.trace("Getting libraryPlugin version");
      final String version = pluginRuntime.getVersion(pluginFilename);
      log.trace("Getting libraryPlugin properties");
      final Map<String, Integer> properties = pluginRuntime.getProperties(pluginFilename);
      log.debug("Creating libraryPlugin: {} v{}", name, version);
      final LibraryPlugin libraryPlugin =
          new LibraryPlugin(name, name, pluginLanguage, version, pluginFilename);
      properties
          .entrySet()
          .forEach(
              property ->
                  libraryPlugin
                      .getProperties()
                      .add(
                          new LibraryPluginProperty(
                              libraryPlugin, property.getKey(), property.getValue())));
      log.debug("Saving libraryPlugin");
      return this.libraryPluginRepository.save(libraryPlugin);
    } catch (Exception error) {
      throw new LibraryPluginException("Failed to create plugin", error);
    }
  }

  /**
   * Updates an existing plugin.
   *
   * @param id the plugin id
   * @param adminOnly the admin-only flag
   * @param properties the properties
   * @return the updated plugin
   * @throws LibraryPluginException if an error occurs
   */
  @Transactional
  public LibraryPlugin updatePlugin(
      final long id, final boolean adminOnly, final Map<String, String> properties)
      throws LibraryPluginException {
    log.trace("Loading libraryPlugin: id={}", id);
    final LibraryPlugin libraryPlugin = this.doLoadPlugin(id);
    log.trace("Setting admin-only={}", adminOnly);
    libraryPlugin.setAdminOnly(adminOnly);
    properties
        .entrySet()
        .forEach(
            entry -> {
              final String name = entry.getKey();
              final String value = entry.getValue();
              final Optional<LibraryPluginProperty> property =
                  libraryPlugin.getProperties().stream()
                      .filter(item -> item.getName().equals(name))
                      .findFirst();
              if (property.isPresent()) {
                log.debug("Updating property: {}={}", name, value);
                property.get().setValue(value);
              } else {
                log.trace("Property not found: {}", name);
              }
            });
    log.debug("Updating libraryPlugin: id={}", id);
    return this.libraryPluginRepository.save(libraryPlugin);
  }

  /**
   * Deletes the specified plugin.
   *
   * @param id the plugin id
   * @throws LibraryPluginException if an error occurs
   */
  @Transactional
  public void deletePlugin(final long id) throws LibraryPluginException {
    log.debug("Deleting plugin: id={}", id);
    this.libraryPluginRepository.delete(this.doLoadPlugin(id));
  }

  private LibraryPlugin doLoadPlugin(final long id) throws LibraryPluginException {
    final LibraryPlugin result = this.libraryPluginRepository.getById(id);
    if (result == null) throw new LibraryPluginException("No such plugin: id=" + id);
    return result;
  }

  /**
   * Runs a plugin against a list of comic books.
   *
   * @param pluginId the plugin id
   * @param comicBookIds the comic book id
   * @throws LibraryPluginException if an error occurs
   */
  @Transactional
  public void runLibraryPlugin(final long pluginId, final List<Long> comicBookIds)
      throws LibraryPluginException {
    try {
      log.trace("Loading plugin: id={}", pluginId);
      final LibraryPlugin plugin = this.doLoadPlugin(pluginId);
      log.trace("Loading plugin runtime: {}", plugin.getLanguage());
      final PluginRuntime pluginRuntime =
          this.pluginRuntimeRegistry.getPluginRuntime(plugin.getLanguage());
      pluginRuntime.addProperty(PROPERTY_NAME_LOG, log);
      log.trace("Adding services to runtime");
      pluginRuntime.addProperty(PROPERTY_NAME_COMIC_BOOK_SERVICE, this.comicBookService);
      pluginRuntime.addProperty(PROPERTY_NAME_READING_LIST_SERVICE, this.readingListService);
      log.trace("Adding comic book ids to runtime");
      pluginRuntime.addProperty("comicBookIds", comicBookIds);
      log.debug("Running plugin");
      pluginRuntime.execute(plugin);
    } catch (PluginRuntimeException error) {
      throw new LibraryPluginException("Failed to run plugin", error);
    }
  }
}
