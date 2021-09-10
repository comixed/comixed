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

package org.comixedproject.batch.comicbooks.processors;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_RENAMING_RULE;
import static org.comixedproject.batch.comicbooks.ConsolidationConfiguration.PARAM_TARGET_DIRECTORY;

import java.io.File;
import java.io.IOException;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class MoveComicProcessorTest {
  private static final String TEST_TARGET_DIRECTORY = "The target directory";
  private static final String TEST_RENAMING_RULE = "The renaming rule";
  private static final String TEST_NEW_FILENAME = "comic.cbz";

  @InjectMocks private MoveComicProcessor processor;
  @Mock private StepExecution stepExecution;
  @Mock private JobExecution jobExecution;
  @Mock private JobParameters jobParameters;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private Comic comic;
  @Mock private File comicFile;

  @Captor private ArgumentCaptor<File> createDirectoryArgumentCaptor;
  @Captor private ArgumentCaptor<File> sourceFileArgumentCaptor;
  @Captor private ArgumentCaptor<File> targetFileArgumentCaptor;

  @Before
  public void setUp() {
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    processor.beforeStep(stepExecution);
  }

  @Test
  public void testProcess() throws Exception {
    Mockito.when(jobParameters.getString(PARAM_TARGET_DIRECTORY)).thenReturn(TEST_TARGET_DIRECTORY);
    Mockito.when(jobParameters.getString(PARAM_RENAMING_RULE)).thenReturn(TEST_RENAMING_RULE);
    Mockito.doNothing().when(fileAdaptor).createDirectory(createDirectoryArgumentCaptor.capture());
    Mockito.when(
            comicFileAdaptor.createFilenameFromRule(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_NEW_FILENAME);
    Mockito.when(comic.getFile()).thenReturn(comicFile);
    Mockito.doNothing()
        .when(fileAdaptor)
        .moveFile(sourceFileArgumentCaptor.capture(), targetFileArgumentCaptor.capture());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    assertEquals(TEST_TARGET_DIRECTORY, createDirectoryArgumentCaptor.getValue().getPath());
    assertSame(comicFile, sourceFileArgumentCaptor.getValue());
    assertEquals(
        new File(TEST_TARGET_DIRECTORY, TEST_NEW_FILENAME).getAbsolutePath(),
        targetFileArgumentCaptor.getValue().getAbsolutePath());

    Mockito.verify(fileAdaptor, Mockito.times(1))
        .createDirectory(createDirectoryArgumentCaptor.getValue());
    Mockito.verify(comicFileAdaptor, Mockito.times(1))
        .createFilenameFromRule(comic, TEST_RENAMING_RULE);
    Mockito.verify(fileAdaptor, Mockito.times(1))
        .moveFile(sourceFileArgumentCaptor.getValue(), targetFileArgumentCaptor.getValue());
  }

  @Test
  public void testProcessMoveFileException() throws Exception {
    Mockito.when(jobParameters.getString(PARAM_TARGET_DIRECTORY)).thenReturn(TEST_TARGET_DIRECTORY);
    Mockito.when(jobParameters.getString(PARAM_RENAMING_RULE)).thenReturn(TEST_RENAMING_RULE);
    Mockito.doNothing().when(fileAdaptor).createDirectory(createDirectoryArgumentCaptor.capture());
    Mockito.when(
            comicFileAdaptor.createFilenameFromRule(Mockito.any(Comic.class), Mockito.anyString()))
        .thenReturn(TEST_NEW_FILENAME);
    Mockito.when(comic.getFile()).thenReturn(comicFile);
    Mockito.doThrow(IOException.class)
        .when(fileAdaptor)
        .moveFile(sourceFileArgumentCaptor.capture(), targetFileArgumentCaptor.capture());

    final Comic result = processor.process(comic);

    assertNotNull(result);
    assertSame(comic, result);

    assertEquals(TEST_TARGET_DIRECTORY, createDirectoryArgumentCaptor.getValue().getPath());
    assertSame(comicFile, sourceFileArgumentCaptor.getValue());
    assertEquals(
        new File(TEST_TARGET_DIRECTORY, TEST_NEW_FILENAME).getAbsolutePath(),
        targetFileArgumentCaptor.getValue().getAbsolutePath());

    Mockito.verify(fileAdaptor, Mockito.times(1))
        .createDirectory(createDirectoryArgumentCaptor.getValue());
    Mockito.verify(comicFileAdaptor, Mockito.times(1))
        .createFilenameFromRule(comic, TEST_RENAMING_RULE);
    Mockito.verify(fileAdaptor, Mockito.times(1))
        .moveFile(sourceFileArgumentCaptor.getValue(), targetFileArgumentCaptor.getValue());
  }

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}
