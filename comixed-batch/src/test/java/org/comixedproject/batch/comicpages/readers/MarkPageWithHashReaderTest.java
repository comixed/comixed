package org.comixedproject.batch.comicpages.readers;

import static junit.framework.TestCase.*;
import static org.comixedproject.batch.comicpages.MarkPagesWithHashConfiguration.PARAM_MARK_PAGES_TARGET_HASH;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.service.comicpages.PageService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.StepExecution;

@RunWith(MockitoJUnitRunner.class)
public class MarkPageWithHashReaderTest {
  private static final int MAX_RECORDS = 25;
  private static final String TEST_PAGE_HASH = "T4RG3TP4G3H45H";

  @InjectMocks private MarkPageWithHashReader reader;
  @Mock private StepExecution stepException;
  @Mock private JobParameters jobParameters;
  @Mock private PageService pageService;
  @Mock private Page page;

  private List<Page> pageList = new ArrayList<>();

  @Test
  public void testBeforeStep() {
    Mockito.when(stepException.getJobParameters()).thenReturn(jobParameters);
    Mockito.when(jobParameters.getString(PARAM_MARK_PAGES_TARGET_HASH)).thenReturn(TEST_PAGE_HASH);

    reader.beforeStep(stepException);

    assertEquals(TEST_PAGE_HASH, reader.targetHash);
  }

  @Test
  public void testAfterStep() {
    assertNull(reader.afterStep(stepException));
  }

  @Test
  public void testReadNoneLoadedManyFound() {
    for (int index = 0; index < MAX_RECORDS; index++) pageList.add(page);

    Mockito.when(pageService.getUnmarkedWithHash(Mockito.anyString())).thenReturn(pageList);
    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNotNull(result);
    assertSame(page, result);
    assertFalse(pageList.isEmpty());
    assertEquals(MAX_RECORDS - 1, pageList.size());

    Mockito.verify(pageService, Mockito.times(1)).getUnmarkedWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testReadNoneRemaining() {
    reader.pageList = pageList;
    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNull(result);
    assertNull(reader.pageList);

    Mockito.verify(pageService, Mockito.never()).getUnmarkedWithHash(TEST_PAGE_HASH);
  }

  @Test
  public void testReadNoneLoadedNoneFound() {
    Mockito.when(pageService.getUnmarkedWithHash(Mockito.anyString())).thenReturn(pageList);

    reader.targetHash = TEST_PAGE_HASH;

    final Page result = reader.read();

    assertNull(result);
    assertNull(reader.pageList);

    Mockito.verify(pageService, Mockito.times(1)).getUnmarkedWithHash(TEST_PAGE_HASH);
  }
}
