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

package org.comixedproject.plugins.runners;

import lombok.extern.log4j.Log4j2;
import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.interpreters.PluginInterpreter;
import org.comixedproject.plugins.model.Plugin;
import org.springframework.stereotype.Component;

/**
 * <code>PluginRunner</code> provides a component that can execute Python code from within the
 * context of a ComiXed application.
 *
 * <p>It runs the code by spawning a new instance of the interpreter for each set of code to be
 * executed. This is done to keep allow each plugin to run in its own pristine environment.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class PluginRunner {
  /**
   * Starts the execution of a plugin.
   *
   * @param interpreter the interpreter for the plugin
   * @param plugin the plugin
   */
  public void execute(PluginInterpreter interpreter, Plugin plugin) throws PluginException {
    log.debug("invoking interpreter lifecycle method: initialize()");
    interpreter.initialize();

    log.debug("invoking interpreter lifecycle method: start()");
    interpreter.start(plugin);

    log.debug("invoking interpreter lifecycle method: finish()");
    interpreter.finish();
  }
}
