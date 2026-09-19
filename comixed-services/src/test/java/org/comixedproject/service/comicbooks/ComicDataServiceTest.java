/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2026, The ComiXed Project.
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

package org.comixedproject.service.comicbooks;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;
import static junit.framework.TestCase.assertTrue;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

import java.util.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.*;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ComicDataServiceTest {
  private static final long TEST_COMIC_ID = 717L;
  private static final String TEST_COMIC_FILENAME = "src/test/resources/example.cbz";
  private static final ComicType TEST_COMIC_TYPE =
      ComicType.values()[RandomUtils.nextInt(ComicType.values().length)];
  private static final String TEST_PUBLISHER = "Awesome Publications";
  private static final String TEST_SERIES = "SeriesDetail Name";
  private static final String TEST_VOLUME = "Volume Name";
  private static final String TEST_ISSUE_NUMBER = "237";
  private static final String TEST_SORTABLE_NAME = "Sortable Name";
  private static final String TEST_IMPRINT = "Incredible Imprints";
  private static final String TEST_TITLE = "The Issue Title";
  private static final Date TEST_COVER_DATE = new Date();
  private static final Date TEST_STORE_DATE =
      new Date(System.currentTimeMillis() - 30L * 24L * 60L * 60L * 24L);

  @InjectMocks private ComicDataService service;
  @Mock private DisplayableComicService displayableComicService;
  @Mock private ComicService comicService;
  @Mock private ComicPageService comicPageService;
  @Mock private ComicMetadataSourceService comicMetadataSourceService;
  @Mock private ComicTagService comicTagService;
  @Mock private ImprintService imprintService;
  @Mock private ComicStateAdaptor comicStateAdaptor;
  @Mock private FileTypeAdaptor fileTypeAdaptor;

  @Mock private DisplayableComic displayableComic;
  @Mock private Comic comic;
  @Mock private ComicMetadataSource comicMetadataSource;
  @Mock private List<ComicTag> tagList;

  private List<ComicPage> pageList = new ArrayList<>();

  @Test
  void getComic_noSuchComic() throws ComicException {
    when(displayableComicService.getForComicBookId(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> service.getComic(TEST_COMIC_ID));

    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
  }

  @Test
  void getComic() throws ComicException {
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComic);
    when(comicPageService.getPagesForComicBook(anyLong())).thenReturn(pageList);
    when(comicMetadataSourceService.getMetadataForComicBook(anyLong()))
        .thenReturn(comicMetadataSource);
    when(comicTagService.getTagsForComicBook(anyLong())).thenReturn(tagList);

    final ComicDataSet result = service.getComic(TEST_COMIC_ID);

    assertNotNull(result);
    assertSame(displayableComic, result.getComic());
    assertSame(pageList, result.getPages());
    assertSame(comicMetadataSource, result.getMetadata());
    assertSame(tagList, result.getTags());

    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
    verify(comicPageService).getPagesForComicBook(TEST_COMIC_ID);
    verify(comicMetadataSourceService).getMetadataForComicBook(TEST_COMIC_ID);
    verify(comicTagService).getTagsForComicBook(TEST_COMIC_ID);
  }

  @Test
  void getComicContent_noSuchComic() throws ComicException {
    when(comicService.getComic(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> this.service.getComicContent(TEST_COMIC_ID));

    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void getComicContent_filenameNotFound() throws ComicException {
    when(comicService.getComic(anyLong())).thenReturn(comic);
    when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME.substring(1));

    assertThrows(ComicException.class, () -> this.service.getComicContent(TEST_COMIC_ID));

    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void getComicContent() throws ComicException {
    when(comicService.getComic(anyLong())).thenReturn(comic);
    when(comic.getFilename()).thenReturn(TEST_COMIC_FILENAME);

    final DownloadDocument result = this.service.getComicContent(TEST_COMIC_ID);

    assertNotNull(result);
    assertEquals(FilenameUtils.getName(TEST_COMIC_FILENAME), result.getFilename());
    assertNotNull(result.getContent());
    assertTrue(result.getContent().length > 0);

    verify(comicService).getComic(TEST_COMIC_ID);
    verify(fileTypeAdaptor).getMimeTypeFor(any());
  }

  @Test
  void updateComic_invalidComicId() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenThrow(ComicException.class);

    assertThrows(
        ComicException.class,
        () ->
            service.updateComic(
                TEST_COMIC_ID,
                TEST_COMIC_TYPE,
                TEST_PUBLISHER,
                TEST_SERIES,
                TEST_VOLUME,
                TEST_ISSUE_NUMBER,
                TEST_IMPRINT,
                TEST_SORTABLE_NAME,
                TEST_TITLE,
                TEST_COVER_DATE,
                TEST_STORE_DATE));

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
  }

  @Test
  void updateComic_partial() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComic);
    when(comicPageService.getPagesForComicBook(anyLong())).thenReturn(pageList);
    when(comicMetadataSourceService.getMetadataForComicBook(anyLong()))
        .thenReturn(comicMetadataSource);
    when(comicTagService.getTagsForComicBook(anyLong())).thenReturn(tagList);

    final ComicDataSet result =
        service.updateComic(
            TEST_COMIC_ID,
            null,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            "",
            "",
            "",
            null,
            null);

    assertNotNull(result);
    assertSame(displayableComic, result.getComic());
    assertSame(pageList, result.getPages());
    assertSame(comicMetadataSource, result.getMetadata());
    assertSame(tagList, result.getTags());

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comic).setPublisher(TEST_PUBLISHER);
    verify(comic).setSeries(TEST_SERIES);
    verify(comic).setVolume(TEST_VOLUME);
    verify(comic).setIssueNumber(TEST_ISSUE_NUMBER);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicMetadataChanged);
    verify(imprintService).update(comic);

    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicMetadataChanged);
    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicPageService).getPagesForComicBook(TEST_COMIC_ID);
    verify(comicMetadataSourceService).getMetadataForComicBook(TEST_COMIC_ID);
    verify(comicTagService).getTagsForComicBook(TEST_COMIC_ID);
  }

  @Test
  void updateComic() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);
    when(displayableComicService.getForComicBookId(anyLong())).thenReturn(displayableComic);
    when(comicPageService.getPagesForComicBook(anyLong())).thenReturn(pageList);
    when(comicMetadataSourceService.getMetadataForComicBook(anyLong()))
        .thenReturn(comicMetadataSource);
    when(comicTagService.getTagsForComicBook(anyLong())).thenReturn(tagList);

    final ComicDataSet result =
        service.updateComic(
            TEST_COMIC_ID,
            TEST_COMIC_TYPE,
            TEST_PUBLISHER,
            TEST_SERIES,
            TEST_VOLUME,
            TEST_ISSUE_NUMBER,
            TEST_IMPRINT,
            TEST_SORTABLE_NAME,
            TEST_TITLE,
            TEST_COVER_DATE,
            TEST_STORE_DATE);

    assertNotNull(result);
    assertSame(displayableComic, result.getComic());
    assertSame(pageList, result.getPages());
    assertSame(comicMetadataSource, result.getMetadata());
    assertSame(tagList, result.getTags());

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comic).setComicType(TEST_COMIC_TYPE);
    verify(comic).setPublisher(TEST_PUBLISHER);
    verify(comic).setImprint(TEST_IMPRINT);
    verify(comic).setSeries(TEST_SERIES);
    verify(comic).setVolume(TEST_VOLUME);
    verify(comic).setIssueNumber(TEST_ISSUE_NUMBER);
    verify(comic).setSortName(TEST_SORTABLE_NAME);
    verify(comic).setTitle(TEST_TITLE);
    verify(comic).setCoverDate(TEST_COVER_DATE);
    verify(comic).setStoreDate(TEST_STORE_DATE);
    verify(imprintService).update(comic);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicMetadataChanged);
    verify(displayableComicService).getForComicBookId(TEST_COMIC_ID);
    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicPageService).getPagesForComicBook(TEST_COMIC_ID);
    verify(comicMetadataSourceService).getMetadataForComicBook(TEST_COMIC_ID);
    verify(comicTagService).getTagsForComicBook(TEST_COMIC_ID);
  }

  @Test
  void savePageOrder_invalidId() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    when(comicService.getComic(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> service.savePageOrder(TEST_COMIC_ID, entryList));

    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void savePageOrder_containsGap() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      entryList.add(new PageOrderEntry(String.format("filename-%d", index), index * 2));
      final String filename = String.format("filename-%d", index);
      final ComicPage page = new ComicPage();
      page.setFilename(filename);
      pageList.add(page);
    }

    when(comicService.getComic(anyLong())).thenReturn(comic);

    assertThrows(ComicException.class, () -> service.savePageOrder(TEST_COMIC_ID, entryList));

    verify(comicService).getComic(TEST_COMIC_ID);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void savePageOrder_missingFilename() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename.substring(1));
      pageList.add(page);
    }

    when(comicService.getComic(anyLong())).thenReturn(comic);
    when(comic.getPages()).thenReturn(pageList);

    assertThrows(ComicException.class, () -> service.savePageOrder(TEST_COMIC_ID, entryList));

    verify(comicService).getComic(TEST_COMIC_ID);
  }

  @Test
  void savePageOrder() throws ComicException {
    List<PageOrderEntry> entryList = new ArrayList<>();
    for (int index = 0; index < 25; index++) {
      final String filename = String.format("filename-%d", index);
      entryList.add(new PageOrderEntry(filename, 24 - index));
      final ComicPage page = new ComicPage();
      page.setFilename(filename);
      pageList.add(page);
    }

    when(comicService.getComic(anyLong())).thenReturn(comic);
    when(comic.getPages()).thenReturn(pageList);

    service.savePageOrder(TEST_COMIC_ID, entryList);

    for (int index = 0; index < entryList.size(); index++) {
      final PageOrderEntry pageOrderEntry = entryList.get(index);
      final Optional<ComicPage> pageListEntry =
          pageList.stream()
              .filter(entry -> entry.getFilename().equals(pageOrderEntry.getFilename()))
              .findFirst();

      assertTrue(pageListEntry.isPresent());
      assertEquals(pageOrderEntry.getPosition(), pageListEntry.get().getPageNumber().intValue());
    }

    verify(comicService).getComic(TEST_COMIC_ID);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.comicMetadataChanged);
  }

  @Test
  void deleteComicBook_noSuchComic() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> service.deleteComicBook(TEST_COMIC_ID));

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void deleteComicBook() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);

    service.deleteComicBook(TEST_COMIC_ID);

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.markComicForRemoval);
  }

  @Test
  void undeleteComicBook_noSuchComic() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenThrow(ComicException.class);

    assertThrows(ComicException.class, () -> service.undeleteComicBook(TEST_COMIC_ID));

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void deleteComicBooksById_invalidId() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenThrow(ComicException.class);

    final List<Long> comicIdList = new ArrayList<>(Arrays.asList(TEST_COMIC_ID));

    assertThrows(ComicException.class, () -> service.deleteComicBooksById(comicIdList));

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void deleteComicBooksById() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);

    final List<Long> comicIdList = new ArrayList<>(Arrays.asList(TEST_COMIC_ID));

    service.deleteComicBooksById(comicIdList);

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.markComicForRemoval);
  }

  @Test
  void undeleteComicBooksById_invalidId() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenThrow(ComicException.class);

    final List<Long> comicIdList = new ArrayList<>(Arrays.asList(TEST_COMIC_ID));

    assertThrows(ComicException.class, () -> service.undeleteComicBooksById(comicIdList));

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor, never()).fireEvent(any(), any());
  }

  @Test
  void undeleteComicBooksById() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);

    final List<Long> comicIdList = new ArrayList<>(Arrays.asList(TEST_COMIC_ID));

    service.undeleteComicBooksById(comicIdList);

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.unmarkComicForRemoval);
  }

  @Test
  void undeleteComicBook() throws ComicException {
    when(comicService.getByComicBookId(anyLong())).thenReturn(comic);

    service.undeleteComicBook(TEST_COMIC_ID);

    verify(comicService).getByComicBookId(TEST_COMIC_ID);
    verify(comicStateAdaptor).fireEvent(comic, ComicEvent.unmarkComicForRemoval);
  }
}
