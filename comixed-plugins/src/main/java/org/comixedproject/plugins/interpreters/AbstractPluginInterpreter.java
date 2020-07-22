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
 * <code>AbstractPluginInterpreter</code> defines a base type for providing concrete implementations
 * of {@link PluginInterpreter}.
 *
 * @author Darryl L. Pierce
 */
public abstract class AbstractPluginInterpreter implements PluginInterpreter {
  @Override
  public void initialize() throws PluginException {}

  @Override
  public void start(Plugin plugin) throws PluginException {}

  @Override
  public void finish() throws PluginException {}
}
