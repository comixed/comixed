/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

import static org.comixedproject.plugins.interpreters.PythonPluginInterpreter.*;
import static org.junit.Assert.*;

import org.comixedproject.plugins.PluginException;
import org.comixedproject.plugins.model.Plugin;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.comic.PageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class PythonPluginInterpreterTest {
  @InjectMocks private PythonPluginInterpreter interpreter;
  @Mock private ComicService comicService;
  @Mock private PageService pageService;
  @Mock private Plugin plugin;

  @Test
  public void testInitialize() throws PluginException {
    interpreter.initialize();

    assertNotNull(interpreter.interpreter);
    assertSame(comicService, interpreter.interpreter.get(COMIC_SERVICE, ComicService.class));
    assertSame(pageService, interpreter.interpreter.get(PAGE_SERVICE, PageService.class));
    assertNotNull(interpreter.interpreter.get(LOGGER));
  }

  @Test
  public void testStart() throws PluginException {
    interpreter.start(plugin);

    Mockito.verify(plugin, Mockito.never()).execute();
  }

  @Test
  public void testFinish() throws PluginException {
    interpreter.finish();
  }
}
