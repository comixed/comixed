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

import lombok.extern.log4j.Log4j2;
import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.model.Plugin;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.comic.PageService;
import org.python.util.PythonInterpreter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

/**
 * <code>PythonPluginInterpreter</code> defines a type of {@link PluginInterpreter} that executes
 * Python code.
 *
 * @author Darryl L. Pierce
 */
@Component
@Scope(value = ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@Log4j2
public class PythonPluginInterpreter extends AbstractPluginInterpreter {
  @Autowired private ComicService comicService;
  @Autowired private PageService pageService;

  private PythonInterpreter interpreter;

  @Override
  public void initialize() throws PluginException {
    super.initialize();

    log.debug("Initializing Python runtime environment");
    this.interpreter = new PythonInterpreter();

    this.loadRuntimeObjects();
  }

  private void loadRuntimeObjects() {
    log.debug("Loading ComiXed Python runtime objects");
    this.interpreter.set("comicService", this.comicService);
    this.interpreter.set("pageService", this.pageService);
    this.interpreter.set("logger", this.log);
  }

  @Override
  public void start(Plugin plugin) throws PluginException {}

  @Override
  public void finish() throws PluginException {
    super.finish();
  }
}
