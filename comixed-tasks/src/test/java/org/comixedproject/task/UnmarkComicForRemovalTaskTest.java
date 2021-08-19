/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project.
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

package org.comixedproject.task;

import static junit.framework.TestCase.assertNotNull;

import org.comixedproject.model.comic.Comic;
import org.comixedproject.service.comic.ComicException;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateHandler;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class UnmarkComicForRemovalTaskTest {
  @InjectMocks private UnmarkComicForRemovalTask task;
  @Mock private ComicStateHandler comicStateHandler;
  @Mock private Comic comic;

  @Test
  public void testCreateDescription() {
    assertNotNull(task.createDescription());
  }

  @Test
  public void testStartTask() throws TaskException, ComicException {
    task.setComic(comic);

    Mockito.doNothing()
        .when(comicStateHandler)
        .fireEvent(Mockito.any(Comic.class), Mockito.any(ComicEvent.class));

    task.startTask();

    Mockito.verify(comicStateHandler, Mockito.times(1))
        .fireEvent(comic, ComicEvent.unmarkedForRemoval);
  }
}
