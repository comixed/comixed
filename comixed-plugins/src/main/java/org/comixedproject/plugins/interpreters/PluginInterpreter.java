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

package org.comixedproject.plugins.interpreters;

import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.model.Plugin;

/**
 * <code>PluginInterpreter</code> defines a type that provides the interpreter for a plugin's
 * execution environment.
 *
 * @author Darryl L. Pierce
 */
public interface PluginInterpreter {
  /**
   * Invoked to initialize the plugin's runtime environemnt.
   *
   * @throws PluginException if an error occurs
   */
  void initialize() throws PluginException;

  /**
   * Invoked to begin execution of the plugin.
   *
   * @param plugin the plugin
   * @throws PluginException if an error occurs
   */
  void start(Plugin plugin) throws PluginException;

  /**
   * Invoked after the plugin has finished executing and is destroyed.
   *
   * @throws PluginException if an error occurs
   */
  void finish() throws PluginException;
}
