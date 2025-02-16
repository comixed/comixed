package org.comixedproject.service.library;

import static junit.framework.TestCase.*;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.model.comicbooks.ComicDetail;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DuplicatePage;
import org.comixedproject.repositories.comicpages.ComicPageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DuplicatePageServiceTest {
  private static final String TEST_PAGE_HASH = "1234567890ABCDEF";
  private static final int TEST_PAGE_NUMBER = 23;
  private static final int TEST_PAGE_SIZE = 10;
  private static final String TEST_SORT_BY = "hash";
  private static final String TEST_SORT_DIRECTION = "desc";

  @InjectMocks private DuplicatePageService service;
  @Mock private ComicPageRepository comicPageRepository;
  @Mock private ComicBook comicBook;
  @Mock private ComicDetail comicDetail;
  @Mock private DuplicatePage duplicatePage;
  @Mock private ComicPage comicPage;

  @Captor private ArgumentCaptor<PageRequest> pageRequestArgumentCaptor;
  @Captor private ArgumentCaptor<Set<ComicDetail>> comicDetailArgumentCaptor;

  private List<DuplicatePage> duplicatePageList = new ArrayList<>();
  private List<ComicPage> comicPageList = new ArrayList<>();

  @BeforeEach
  public void setUp() {
    Mockito.when(comicBook.getComicDetail()).thenReturn(comicDetail);
    Mockito.when(comicPage.getComicBook()).thenReturn(comicBook);
  }

  @Test
  void getDuplicatePages() {
    duplicatePageList.add(duplicatePage);
    comicPageList.add(comicPage);

    Mockito.when(comicPageRepository.getDuplicatePages(pageRequestArgumentCaptor.capture()))
        .thenReturn(duplicatePageList);

    List<DuplicatePage> result =
        service.getDuplicatePages(
            TEST_PAGE_NUMBER, TEST_PAGE_SIZE, TEST_SORT_BY, TEST_SORT_DIRECTION);

    assertNotNull(result);
    assertFalse(result.isEmpty());

    final PageRequest pageRequest = pageRequestArgumentCaptor.getValue();
    assertEquals(TEST_PAGE_NUMBER, pageRequest.getPageNumber());
    assertEquals(TEST_PAGE_SIZE, pageRequest.getPageSize());

    Mockito.verify(comicPageRepository, Mockito.times(1)).getDuplicatePages(pageRequest);
  }

  @Test
  void getForHashNotFound() {
    Mockito.when(comicPageRepository.findByHash(Mockito.anyString())).thenReturn(comicPageList);

    assertThrows(DuplicatePageException.class, () -> service.getForHash(TEST_PAGE_HASH));
  }

  @Test
  void getForHash() throws DuplicatePageException {
    comicPageList.add(comicPage);

    Mockito.when(comicPageRepository.findByHash(Mockito.anyString())).thenReturn(comicPageList);

    final DuplicatePage result = service.getForHash(TEST_PAGE_HASH);

    assertNotNull(result);
    assertEquals(TEST_PAGE_HASH, result.getHash());
    assertTrue(result.getComics().contains(comicDetail));

    Mockito.verify(comicPageRepository, Mockito.times(1)).findByHash(TEST_PAGE_HASH);
  }
}
