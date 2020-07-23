/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2017, The ComiXed Project
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

package org.comixedproject.adaptors;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import org.comixedproject.loaders.BaseLoaderTest;
import org.comixedproject.loaders.EntryLoaderException;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicInfoEntryAdaptorTest extends BaseLoaderTest {
  private static final String TEST_COMICINFO_FILE_COMPLETE =
      "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_PUBLISHER_NAME = "Test Publisher";
  private static final String TEST_SERIES_NAME = "Test Series";
  private static final String TEST_VOLUME_NAME = "2011";
  @InjectMocks ComicInfoEntryAdaptor adaptor;

  private Comic comic;

  @Before
  public void setUp() {
    comic = new Comic();

    comic.setPublisher(TEST_PUBLISHER_NAME);
    comic.setSeries(TEST_SERIES_NAME);
    comic.setVolume(TEST_VOLUME_NAME);
    comic.setCoverDate(new Date());
    comic.setDateAdded(new Date());
  }

  @Test
  public void testLoadComicInfoXml() throws IOException, EntryLoaderException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE));

    assertEquals(TEST_PUBLISHER_NAME, comic.getPublisher());
    assertEquals(TEST_SERIES_NAME, comic.getSeries());
    assertEquals(TEST_VOLUME_NAME, comic.getVolume());
    assertEquals("Test Title", comic.getTitle());
    assertEquals("24", comic.getIssueNumber());
    assertEquals("Test summary", comic.getSummary());
    assertEquals("Test notes", comic.getNotes());

    Calendar gc = Calendar.getInstance();
    gc.setTime(comic.getCoverDate());
    assertEquals(2013, gc.get(Calendar.YEAR));
    assertEquals(11, gc.get(Calendar.MONTH));
  }

  @Test
  public void testSaveComicInfoXml() throws EntryLoaderException, IOException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE));

    byte[] result = adaptor.saveContent(comic);

    Comic second = new Comic();
    adaptor.loadContent(second, TEST_COMICINFO_FILE_COMPLETE, result);

    assertEquals(comic.getPublisher(), second.getPublisher());
    assertEquals(comic.getSeries(), second.getSeries());
    assertEquals(comic.getVolume(), second.getVolume());
    assertEquals(comic.getIssueNumber(), second.getIssueNumber());
    assertEquals(comic.getTitle(), second.getTitle());
    assertEquals(comic.getSummary(), second.getSummary());
    assertEquals(comic.getNotes(), second.getNotes());
    assertEquals(comic.getCoverDate(), second.getCoverDate());
    assertEquals(comic.getCharacters(), second.getCharacters());
    assertEquals(comic.getTeams(), second.getTeams());
    assertEquals(comic.getLocations(), second.getLocations());
  }
}
