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

package org.comixedproject.rest.comicpages;

import static junit.framework.TestCase.assertSame;
import static org.comixedproject.batch.comicpages.MarkPagesWithHashConfiguration.PARAM_MARK_PAGES_TARGET_HASH;
import static org.comixedproject.batch.comicpages.MarkPagesWithHashConfiguration.PARAM_MARK_PAGES_WITH_HASH_STARTED;
import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_TARGET_HASH;
import static org.comixedproject.batch.comicpages.UnmarkPagesWithHashConfiguration.PARAM_UNMARK_PAGES_WITH_HASH_STARTED;
import static org.junit.Assert.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.blockedpage.DeleteBlockedPagesRequest;
import org.comixedproject.model.net.blockedpage.MarkPageWithHashRequest;
import org.comixedproject.model.net.blockedpage.UnmarkPageWithHashRequest;
import org.comixedproject.model.net.comicpages.SetBlockedPageRequest;
import org.comixedproject.service.comicpages.BlockedHashException;
import org.comixedproject.service.comicpages.BlockedHashService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersInvalidException;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobExecutionAlreadyRunningException;
import org.springframework.batch.core.repository.JobInstanceAlreadyCompleteException;
import org.springframework.batch.core.repository.JobRestartException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

@RunWith(MockitoJUnitRunner.class)
public class BlockedHashControllerTest {
  private static final String TEST_PAGE_HASH = "0123456789ABCDEF0123456789ABCDEF";
  private static final byte[] TEST_PAGE_CONTENT = "The page content".getBytes();

  @InjectMocks private BlockedHashController controller;
  @Mock private BlockedHashService blockedHashService;
  @Mock private FileTypeAdaptor fileTypeAdaptor;
  @Mock private List<BlockedHash> blockedHashList;
  @Mock private BlockedHash blockedHash;
  @Mock private BlockedHash blockedHashRecord;
  @Mock private DownloadDocument downloadDocument;
  @Mock private MultipartFile uploadedFile;
  @Mock private InputStream inputStream;
  @Mock private List<String> hashList;
  @Mock private List<String> updatedHashList;
  @Mock private List<BlockedHash> blockedHashes = new ArrayList<>();

  @Mock
  @Qualifier("markPagesWithHashJob")
  private Job markPagesWithHashJob;

  @Mock
  @Qualifier("unmarkPagesWithHashJob")
  private Job unmarkPagesWithHashJob;

  @Mock private JobLauncher jobLauncher;
  @Mock private JobExecution jobExecution;

  @Captor private ArgumentCaptor<JobParameters> jobParametersArgumentCaptor;

  @Before
  public void setUp() {
    blockedHashes.add(blockedHashRecord);
    Mockito.when(fileTypeAdaptor.getType(Mockito.any())).thenReturn("jpeg");
  }

  @Test
  public void testLoadAll() {
    Mockito.when(blockedHashService.getAll()).thenReturn(blockedHashList);

    final List<BlockedHash> result = controller.getAll();

    assertNotNull(result);
    assertSame(blockedHashList, result);

    Mockito.verify(blockedHashService, Mockito.times(1)).getAll();
  }

  @Test(expected = BlockedHashException.class)
  public void testGetOneServiceException() throws BlockedHashException {
    Mockito.when(blockedHashService.getByHash(Mockito.anyString()))
        .thenThrow(BlockedHashException.class);

    try {
      controller.getByHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedHashService, Mockito.times(1)).getByHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetOne() throws BlockedHashException {
    Mockito.when(blockedHashService.getByHash(Mockito.anyString())).thenReturn(blockedHashRecord);

    final BlockedHash result = controller.getByHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(blockedHashRecord, result);

    Mockito.verify(blockedHashService, Mockito.times(1)).getByHash(TEST_PAGE_HASH);
  }

  @Test
  public void testBlockPage()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.blockPageHashes(new SetBlockedPageRequest(pageHashList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(PARAM_MARK_PAGES_WITH_HASH_STARTED));
    assertEquals(TEST_PAGE_HASH, jobParameters.getString(PARAM_MARK_PAGES_TARGET_HASH));

    Mockito.verify(blockedHashService, Mockito.times(1)).blockPages(pageHashList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(markPagesWithHashJob, jobParameters);
  }

  @Test
  public void testMarkPagesWithHash()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.markPagesWithHash(new MarkPageWithHashRequest(pageHashList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(PARAM_MARK_PAGES_WITH_HASH_STARTED));
    assertEquals(TEST_PAGE_HASH, jobParameters.getString(PARAM_MARK_PAGES_TARGET_HASH));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(markPagesWithHashJob, jobParameters);
  }

  @Test
  public void testUnblockPage()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.unblockPageHashes(new SetBlockedPageRequest(pageHashList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(PARAM_UNMARK_PAGES_WITH_HASH_STARTED));
    assertEquals(TEST_PAGE_HASH, jobParameters.getString(PARAM_UNMARK_PAGES_TARGET_HASH));

    Mockito.verify(blockedHashService, Mockito.times(1)).unblockPages(pageHashList);
    Mockito.verify(jobLauncher, Mockito.times(1)).run(unmarkPagesWithHashJob, jobParameters);
  }

  @Test
  public void testUnmarkPagesWithHash()
      throws JobInstanceAlreadyCompleteException, JobExecutionAlreadyRunningException,
          JobParametersInvalidException, JobRestartException {
    final List<String> pageHashList = new ArrayList<>();
    pageHashList.add(TEST_PAGE_HASH);

    Mockito.when(jobLauncher.run(Mockito.any(Job.class), jobParametersArgumentCaptor.capture()))
        .thenReturn(jobExecution);

    controller.unmarkPagesWithHash(new UnmarkPageWithHashRequest(pageHashList));

    final JobParameters jobParameters = jobParametersArgumentCaptor.getValue();

    assertNotNull(jobParameters);
    assertTrue(jobParameters.getParameters().containsKey(PARAM_UNMARK_PAGES_WITH_HASH_STARTED));
    assertEquals(TEST_PAGE_HASH, jobParameters.getString(PARAM_UNMARK_PAGES_TARGET_HASH));

    Mockito.verify(jobLauncher, Mockito.times(1)).run(unmarkPagesWithHashJob, jobParameters);
  }

  @Test
  public void testUpdateBlockedPage() throws BlockedHashException {
    Mockito.when(
            blockedHashService.updateBlockedPage(
                Mockito.anyString(), Mockito.any(BlockedHash.class)))
        .thenReturn(blockedHashRecord);

    final BlockedHash result = controller.updateBlockedPage(TEST_PAGE_HASH, blockedHash);

    assertNotNull(result);
    assertSame(blockedHashRecord, result);

    Mockito.verify(blockedHashService, Mockito.times(1))
        .updateBlockedPage(TEST_PAGE_HASH, blockedHash);
  }

  @Test
  public void testDownloadFile() throws IOException {
    Mockito.when(blockedHashService.createFile()).thenReturn(downloadDocument);

    final DownloadDocument response = controller.downloadFile();

    assertNotNull(response);
    assertSame(downloadDocument, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).createFile();
  }

  @Test(expected = IOException.class)
  public void testUploadFileServiceException() throws BlockedHashException, IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedHashService.uploadFile(Mockito.any(InputStream.class)))
        .thenThrow(IOException.class);

    try {
      controller.uploadFile(uploadedFile);
    } finally {
      Mockito.verify(blockedHashService, Mockito.times(1)).uploadFile(inputStream);
    }
  }

  @Test
  public void testUploadFile() throws BlockedHashException, IOException {
    Mockito.when(uploadedFile.getInputStream()).thenReturn(inputStream);
    Mockito.when(blockedHashService.uploadFile(Mockito.any(InputStream.class)))
        .thenReturn(blockedHashList);

    final List<BlockedHash> response = controller.uploadFile(uploadedFile);

    assertNotNull(response);
    assertSame(blockedHashList, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).uploadFile(inputStream);
  }

  @Test
  public void testDeleteBlockedPages() {
    Mockito.when(blockedHashService.deleteBlockedPages(Mockito.anyList()))
        .thenReturn(updatedHashList);

    final List<String> response =
        controller.deleteBlockedPages(new DeleteBlockedPagesRequest(hashList));

    assertNotNull(response);
    assertSame(updatedHashList, response);

    Mockito.verify(blockedHashService, Mockito.times(1)).deleteBlockedPages(hashList);
  }

  @Test(expected = BlockedHashException.class)
  public void testGetBlockedHashThumbnailHashNotFound() throws BlockedHashException {
    Mockito.when(blockedHashService.getThumbnail(Mockito.anyString()))
        .thenThrow(BlockedHashException.class);

    try {
      controller.getThumbnail(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(blockedHashService, Mockito.times(1)).getThumbnail(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetBlockedHashThumbnail() throws BlockedHashException {
    Mockito.when(blockedHashService.getThumbnail(Mockito.anyString()))
        .thenReturn(TEST_PAGE_CONTENT);

    final ResponseEntity<byte[]> result = controller.getThumbnail(TEST_PAGE_HASH);

    assertNotNull(result);
    assertSame(TEST_PAGE_CONTENT, result.getBody());

    Mockito.verify(blockedHashService, Mockito.times(1)).getThumbnail(TEST_PAGE_HASH);
  }
}
