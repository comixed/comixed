/*
 * ComiXed - A digital comicBook book library management application.
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
import java.util.List;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.comicbooks.ComicFileAdaptor;
import org.comixedproject.adaptors.file.FileAdaptor;
import org.comixedproject.model.archives.ArchiveType;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class MoveComicBookProcessorTest {
  private static final String TEST_TARGET_DIRECTORY = "the target directory";
  private static final String TEST_RENAMING_RULE = "the renaming rule";
  private static final ArchiveType TEST_ARCHIVE_TYPE = ArchiveType.CBZ;
  private static final String TEST_REBUILT_FILENAME =
      new File("target/test-classes/rebuilt-example.cbz").getAbsolutePath();
  private static final String TEST_REBUILT_FILENAME_FROM_RULE =
      new File(TEST_REBUILT_FILENAME).getName();
  private static final String TEST_SOURCE_FILENAME =
      new File("target/test-classes/example.cbz").getAbsolutePath();
  private static final String TEST_SOURCE_METADATA_FILENAME =
      new File("target/test-classes/example-metadata.xml").getAbsolutePath();
  private static final String TEST_SOURCE_METADATA_FILENAME_NOT_EXISTS =
      new File("target/test-classes/example-metadata-farkle.xml").getAbsolutePath();
  private static final String TEST_TARGET_METADATA_FILENAME =
      new File("target/test-classes/example-metadata.xml-out").getAbsolutePath();

  @InjectMocks private MoveComicProcessor processor;
  @Mock private JobParameters jobParameters;
  @Mock private JobExecution jobExecution;
  @Mock private StepExecution stepExecution;
  @Mock private FileAdaptor fileAdaptor;
  @Mock private ComicFileAdaptor comicFileAdaptor;
  @Mock private ComicBookAdaptor comicBookAdaptor;
  @Mock private ComicDetail comicDetail;
  @Mock private ComicBook comicBook;
  @Mock private File comicDetailFile;

  @Captor private ArgumentCaptor<File> moveFileSourceArgumentCaptor;
  @Captor private ArgumentCaptor<File> moveFileTargetArgumentCaptor;

  @Before
  public void setUp() throws IOException {
    Mockito.when(jobParameters.getString(PARAM_TARGET_DIRECTORY)).thenReturn(TEST_TARGET_DIRECTORY);
    Mockito.when(jobParameters.getString(PARAM_RENAMING_RULE)).thenReturn(TEST_RENAMING_RULE);
    Mockito.when(comicDetail.getArchiveType()).thenReturn(TEST_ARCHIVE_TYPE);
    Mockito.when(comicDetail.getFile()).thenReturn(comicDetailFile);
    Mockito.when(comicDetail.getFilename()).thenReturn(TEST_SOURCE_FILENAME);
    Mockito.when(
            comicFileAdaptor.findAvailableFilename(
                Mockito.anyString(), Mockito.anyString(), Mockito.anyInt(), Mockito.anyString()))
        .thenReturn(TEST_REBUILT_FILENAME);
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(
            comicFileAdaptor.createFilenameFromRule(
                Mockito.any(ComicBook.class), Mockito.anyString(), Mockito.anyString()))
        .thenReturn(TEST_REBUILT_FILENAME_FROM_RULE);
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_SOURCE_METADATA_FILENAME_NOT_EXISTS);
    Mockito.when(fileAdaptor.sameFile(Mockito.any(File.class), Mockito.any(File.class)))
        .thenReturn(false, false);

    Mockito.doNothing()
        .when(fileAdaptor)
        .moveFile(moveFileSourceArgumentCaptor.capture(), moveFileTargetArgumentCaptor.capture());
  }

  @Test
  public void testProcess() throws IOException {
    processor.process(comicBook);

    List<File> moveFileSources = moveFileSourceArgumentCaptor.getAllValues();
    List<File> moveFileTargets = moveFileTargetArgumentCaptor.getAllValues();

    File comicDetailSourceFile = moveFileSources.get(0);
    assertNotNull(comicDetailSourceFile);
    assertSame(comicDetailFile, comicDetailSourceFile);

    File rebuiltComicBookFile = moveFileTargets.get(0);
    assertNotNull(rebuiltComicBookFile);
    assertEquals(TEST_REBUILT_FILENAME, rebuiltComicBookFile.getAbsolutePath());

    Mockito.verify(fileAdaptor, Mockito.times(1)).moveFile(comicDetailFile, rebuiltComicBookFile);
  }

  @Test
  public void testProcessSourceAndComicFileAreTheSame() throws IOException {
    Mockito.when(fileAdaptor.sameFile(Mockito.any(File.class), Mockito.any(File.class)))
        .thenReturn(true);

    processor.process(comicBook);

    List<File> moveFileSources = moveFileSourceArgumentCaptor.getAllValues();

    Mockito.verify(fileAdaptor, Mockito.never())
        .moveFile(Mockito.any(File.class), Mockito.any(File.class));
  }

  @Test
  public void testProcessMovingFileThrowsException() throws IOException {
    Mockito.doThrow(IOException.class)
        .when(fileAdaptor)
        .moveFile(moveFileSourceArgumentCaptor.capture(), moveFileTargetArgumentCaptor.capture());

    processor.process(comicBook);

    List<File> moveFileSources = moveFileSourceArgumentCaptor.getAllValues();
    List<File> moveFileTargets = moveFileTargetArgumentCaptor.getAllValues();

    assertEquals(moveFileTargets.size(), 1);
    assertEquals(moveFileTargets.size(), 1);

    File metadataFileTarget = moveFileTargets.get(0);
    assertEquals(TEST_REBUILT_FILENAME, metadataFileTarget.getAbsolutePath());

    File metadataFileSource = moveFileSources.get(0);
    assertNull(metadataFileSource.getAbsolutePath());

    Mockito.verify(fileAdaptor, Mockito.times(1)).moveFile(metadataFileSource, metadataFileTarget);
    Mockito.verify(comicDetail, Mockito.never()).setFilename(Mockito.anyString());
  }

  @Test
  public void testProcessMetadataFileExists() throws IOException {
    Mockito.when(comicBookAdaptor.getMetadataFilename(Mockito.any(ComicBook.class)))
        .thenReturn(TEST_SOURCE_METADATA_FILENAME, TEST_TARGET_METADATA_FILENAME);
    Mockito.when(fileAdaptor.sameFile(Mockito.any(File.class), Mockito.any(File.class)))
        .thenReturn(true, false);

    processor.process(comicBook);

    List<File> moveFileSources = moveFileSourceArgumentCaptor.getAllValues();
    List<File> moveFileTargets = moveFileTargetArgumentCaptor.getAllValues();

    assertEquals(moveFileTargets.size(), 1);
    assertEquals(moveFileTargets.size(), 1);

    File metadataFileSource = moveFileSources.get(0);
    assertEquals(TEST_SOURCE_METADATA_FILENAME, metadataFileSource.getAbsolutePath());

    File metadataFileTarget = moveFileTargets.get(0);
    assertEquals(TEST_TARGET_METADATA_FILENAME, metadataFileTarget.getAbsolutePath());

    Mockito.verify(fileAdaptor, Mockito.times(1)).moveFile(metadataFileSource, metadataFileTarget);
  }

  @Test
  public void testProcessMetadataFileExistsAndIsAlreadyInPlace() throws IOException {
    Mockito.when(fileAdaptor.sameFile(Mockito.any(File.class), Mockito.any(File.class)))
        .thenReturn(true, true);

    processor.process(comicBook);

    Mockito.verify(fileAdaptor, Mockito.never())
        .moveFile(Mockito.any(File.class), Mockito.any(File.class));
  }

  @Test
  public void testBeforeStep() {
    Mockito.when(jobExecution.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(stepExecution.getJobExecution()).thenReturn(jobExecution);

    processor.beforeStep(stepExecution);

    assertNotNull(processor.jobParameters);
    assertSame(jobParameters, processor.jobParameters);
  }

  @Test
  public void testAfterStep() {
    assertNull(processor.afterStep(stepExecution));
  }
}
