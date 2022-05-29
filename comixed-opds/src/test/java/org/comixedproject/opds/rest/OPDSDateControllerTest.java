/*
 * ComiXed - A digital comicBook book library management application.
 * Copyright (C) 2022, The ComiXed Project
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

package org.comixedproject.opds.rest;

import static junit.framework.TestCase.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang.math.RandomUtils;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.opds.OPDSException;
import org.comixedproject.opds.OPDSUtils;
import org.comixedproject.opds.model.OPDSAcquisitionFeed;
import org.comixedproject.opds.model.OPDSAcquisitionFeedEntry;
import org.comixedproject.opds.model.OPDSNavigationFeed;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class OPDSDateControllerTest {
  private static final Integer TEST_YEAR = 2022;
  private static final Integer TEST_WEEK = RandomUtils.nextInt(52);
  private static final Long TEST_COMIC_ID = 7623L;
  private static final String TEST_COMIC_FILENAME = "Base Filename.CBZ";
  private static final boolean TEST_UNREAD = RandomUtils.nextBoolean();
  private static final String TEST_EMAIL = "reader@comixedproject.org";

  @InjectMocks private OPDSDateController controller;
  @Mock private ComicBookService comicBookService;
  @Mock private OPDSUtils opdsUtils;
  @Mock private ComicBook comicBook;
  @Mock private Principal principal;
  @Mock private OPDSAcquisitionFeedEntry comicEntry;

  private List<Integer> yearList = new ArrayList<>();
  private List<Integer> weekList = new ArrayList<>();
  private List<ComicBook> comicBookList = new ArrayList<>();

  @Before
  public void setUp() {
    for (int year = 1965; year < 2022; year++) yearList.add(year);
    for (int week = 0; week < 52; week++) weekList.add(week);
    comicBookList.add(comicBook);

    Mockito.when(principal.getName()).thenReturn(TEST_EMAIL);
  }

  @Test
  public void testLoadYears() throws OPDSException {
    Mockito.when(comicBookService.getYearsForComics()).thenReturn(yearList);

    final OPDSNavigationFeed result = controller.loadYears(TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(yearList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1)).getYearsForComics();
  }

  @Test
  public void testLoadWeeksForYear() throws OPDSException {
    Mockito.when(comicBookService.getWeeksForYear(Mockito.anyInt())).thenReturn(weekList);

    final OPDSNavigationFeed result = controller.loadWeeksForYear(TEST_YEAR, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(weekList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1)).getWeeksForYear(TEST_YEAR);
  }

  @Test
  public void testLoadComicsForYearAndWeek() throws OPDSException {
    Mockito.when(
            comicBookService.getComicsForYearAndWeek(
                Mockito.anyInt(), Mockito.anyInt(), Mockito.anyString(), Mockito.anyBoolean()))
        .thenReturn(comicBookList);
    Mockito.when(opdsUtils.createComicEntry(Mockito.any(ComicBook.class))).thenReturn(comicEntry);

    final OPDSAcquisitionFeed result =
        controller.loadComicsForYearAndWeek(principal, TEST_YEAR, TEST_WEEK, TEST_UNREAD);

    assertNotNull(result);
    assertFalse(result.getEntries().isEmpty());
    assertEquals(comicBookList.size(), result.getEntries().size());

    Mockito.verify(comicBookService, Mockito.times(1))
        .getComicsForYearAndWeek(TEST_YEAR, TEST_WEEK, TEST_EMAIL, TEST_UNREAD);
    Mockito.verify(opdsUtils, Mockito.times(1)).createComicEntry(comicBook);
  }
}
