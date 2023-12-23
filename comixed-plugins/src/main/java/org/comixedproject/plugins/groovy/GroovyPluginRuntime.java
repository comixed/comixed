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

package org.comixedproject.plugins.groovy;

import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import groovy.lang.Script;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.model.plugin.LibraryPlugin;
import org.comixedproject.plugins.AbstractPluginRuntime;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>GroovyPluginRuntime</code> provides a runtime environment that loads and executes a Groovy
 * plugin.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class GroovyPluginRuntime extends AbstractPluginRuntime {
  @Override
  public String getName(final String filename) {
    final GroovyShell shell = doCreatePluginShell();
    try {
      log.trace("Loading plugin properties: {}", filename);
      final Script script = shell.parse(new File(filename));
      return (String) script.invokeMethod("plugin_name", new Object[] {});
    } catch (Exception error) {
      log.error("Failed to load plugin properties", error);
      return "";
    }
  }

  @Override
  public String getVersion(final String filename) {
    final GroovyShell shell = doCreatePluginShell();
    try {
      log.trace("Loading plugin properties: {}", filename);
      final Script script = shell.parse(new File(filename));
      return (String) script.invokeMethod("plugin_version", new Object[] {});
    } catch (Exception error) {
      log.error("Failed to load plugin properties", error);
      return "";
    }
  }

  @Override
  public Map<String, Integer> getProperties(final String filename) {
    final GroovyShell shell = doCreatePluginShell();
    try {
      log.trace("Loading plugin properties: {}", filename);
      final Script script = shell.parse(new File(filename));
      return (Map<String, Integer>) script.invokeMethod("plugin_properties", new Object[] {});
    } catch (Exception error) {
      log.error("Failed to load plugin properties", error);
      return new HashMap<>();
    }
  }

  @Override
  public Boolean execute(final LibraryPlugin libraryPlugin) {
    final var shell = doCreatePluginShell();
    try {
      log.trace(
          "Executing libraryPlugin: {} v{}", libraryPlugin.getName(), libraryPlugin.getVersion());
      shell.evaluate(new File(libraryPlugin.getFilename()));
      log.trace("LibraryPlugin completed without error");
      return true;
    } catch (Exception error) {
      log.error("Failed to execute libraryPlugin", error);
      return false;
    }
  }

  private GroovyShell doCreatePluginShell() {
    log.trace("Creating plugin binding");
    final Binding binding = new Binding();
    log.trace("Creating plugin runtime shell");
    final GroovyShell shell = new GroovyShell(binding);
    return shell;
  }
}
