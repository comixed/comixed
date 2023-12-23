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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.plugins.PluginRuntime;
import org.comixedproject.plugins.PluginRuntimeProvider;

/**
 * <code>GroovyPluginRuntimeProvider</code> defines a {@link PluginRuntimeProvider} for Groovy.
 *
 * @author Darryl L. Pierce
 */
@Log4j2
public class GroovyPluginRuntimeProvider implements PluginRuntimeProvider {
  @Override
  public PluginRuntime create() {
    log.trace("Creating an instance of the Groovy plugin runtime");
    return new GroovyPluginRuntime();
  }

  @Override
  public String getName() {
    return "groovy";
  }
}
