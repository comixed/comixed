package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Page;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comicbooks.PageRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class DuplicatePageServiceTest {
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";

  @InjectMocks private DuplicatePageService service;
  @Mock private PageRepository pageRepository;
  @Mock private Comic comic;
  @Mock private Page page;

  private List<Page> pageList = new ArrayList<>();

  @Before
  public void setUp() {
    Mockito.when(page.getHash()).thenReturn(TEST_PAGE_HASH);
    Mockito.when(page.getComic()).thenReturn(comic);
  }

  @Test
  public void testGetDuplicatePages() {
    pageList.add(page);

    Mockito.when(pageRepository.getDuplicatePages()).thenReturn(pageList);

    List<DuplicatePage> result = service.getDuplicatePages();

    assertNotNull(result);
    assertFalse(result.isEmpty());
    assertEquals(TEST_PAGE_HASH, result.get(0).getHash());
    assertTrue(result.get(0).getComics().contains(comic));

    Mockito.verify(pageRepository, Mockito.times(1)).getDuplicatePages();
  }

  @Test(expected = DuplicatePageException.class)
  public void testGetForHashNotFound() throws DuplicatePageException {
    Mockito.when(pageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    try {
      service.getForHash(TEST_PAGE_HASH);
    } finally {
      Mockito.verify(pageRepository, Mockito.times(1)).getPagesWithHash(TEST_PAGE_HASH);
    }
  }

  @Test
  public void testGetForHash() throws DuplicatePageException {
    pageList.add(page);

    Mockito.when(pageRepository.getPagesWithHash(Mockito.anyString())).thenReturn(pageList);

    final DuplicatePage result = service.getForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result.getHash());
    assertTrue(result.getComics().contains(comic));

    Mockito.verify(pageRepository, Mockito.times(1)).getPagesWithHash(TEST_PAGE_HASH);
  }
}
