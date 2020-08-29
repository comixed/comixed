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

package org.comixedproject.task.model;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.tasks.Task;
import org.comixedproject.service.comic.ComicService;
import org.comixedproject.service.task.TaskService;
import org.comixedproject.task.encoders.MoveComicWorkerTaskEncoder;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class MoveComicsWorkerTaskTest {
  private static final String TEST_DIRECTORY = "/users/comixedreader/Documents/comics";
  private static final String TEST_RENAMING_RULE =
      "$PUBLISHER/$SERIES/$VOLUME/$SERIES v$VOLUME #$ISSUE ($COVERDATE)";
  private static final int TEST_MOVED_COMICS = 25;

  @InjectMocks private MoveComicsWorkerTask moveComicsWorkerTask;
  @Mock private ComicService comicService;
  @Mock private ObjectFactory<MoveComicWorkerTaskEncoder> moveComicWorkerTaskEncoderObjectFactory;
  @Mock private MoveComicWorkerTaskEncoder moveComicTaskEncoder;
  @Mock private MoveComicWorkerTask moveComicWorkerTask;
  @Mock private Task task;
  @Mock private TaskService taskService;
  @Mock private Comic comic;
  @Mock private Comic deletedComic;

  private List<Comic> comicList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(deletedComic.getDateDeleted()).thenReturn(new Date());
    for (int index = 0; index < TEST_MOVED_COMICS; index++) comicList.add(comic);
    comicList.add(deletedComic);
  }

  @Test
  public void testStartTask() throws WorkerTaskException {
    Mockito.when(moveComicWorkerTaskEncoderObjectFactory.getObject())
        .thenReturn(moveComicTaskEncoder);
    Mockito.when(comicService.findComicsToMove(Mockito.anyInt())).thenReturn(comicList);
    Mockito.when(moveComicTaskEncoder.encode()).thenReturn(task);
    Mockito.when(taskService.save(Mockito.any(Task.class))).thenReturn(task);

    moveComicsWorkerTask.setDirectory(TEST_DIRECTORY);
    moveComicsWorkerTask.setRenamingRule(TEST_RENAMING_RULE);

    moveComicsWorkerTask.startTask();

    Mockito.verify(moveComicWorkerTaskEncoderObjectFactory, Mockito.times(TEST_MOVED_COMICS))
        .getObject();
    Mockito.verify(moveComicTaskEncoder, Mockito.times(TEST_MOVED_COMICS)).setComic(comic);
    Mockito.verify(moveComicTaskEncoder, Mockito.times(TEST_MOVED_COMICS))
        .setTargetDirectory(TEST_DIRECTORY);
    Mockito.verify(moveComicTaskEncoder, Mockito.times(TEST_MOVED_COMICS))
        .setRenamingRule(TEST_RENAMING_RULE);
    Mockito.verify(taskService, Mockito.times(TEST_MOVED_COMICS)).save(task);
    Mockito.verify(comicService, Mockito.times(1)).delete(deletedComic);
  }
}
