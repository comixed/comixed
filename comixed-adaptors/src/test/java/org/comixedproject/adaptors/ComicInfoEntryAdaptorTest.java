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

import static junit.framework.TestCase.assertNotNull;

import java.io.IOException;
import org.comixedproject.loaders.BaseLoaderTest;
import org.comixedproject.loaders.EntryLoaderException;
import org.comixedproject.model.comic.Comic;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicInfoEntryAdaptorTest extends BaseLoaderTest {
  private static final String TEST_COMICINFO_FILE_COMPLETE =
      "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_PUBLISHER_NAME = "Test Publisher";
  private static final String TEST_SERIES_NAME = "Test Series";
  private static final String TEST_VOLUME_NAME = "2011";
  private static final String TEST_ISSUE_NUMBER = "24";
  private static final String TEST_TITLE = "Test Title";
  private static final String TEST_SUMMARY = "Test summary";
  private static final String TEST_NOTES = "Test notes";

  @InjectMocks ComicInfoEntryAdaptor adaptor;
  @Mock private Comic comic;

  @Before
  public void setup() {
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER_NAME);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(comic.getVolume()).thenReturn(TEST_VOLUME_NAME);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(comic.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(comic.getSummary()).thenReturn(TEST_SUMMARY);
    Mockito.when(comic.getNotes()).thenReturn(TEST_NOTES);
  }

  @Test
  public void testLoadComicInfoXmlIgnoreMetadata() throws IOException, EntryLoaderException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE), true);

    Mockito.verify(comic, Mockito.never()).setPublisher(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setSeries(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setVolume(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setIssueNumber(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setTitle(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setSummary(Mockito.anyString());
    Mockito.verify(comic, Mockito.never()).setNotes(Mockito.anyString());
  }

  @Test
  public void testLoadComicInfoXml() throws IOException, EntryLoaderException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE), false);

    Mockito.verify(comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER_NAME);
    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME_NAME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(comic, Mockito.times(1)).setSummary(TEST_SUMMARY);
    Mockito.verify(comic, Mockito.times(1)).setNotes(TEST_NOTES);
  }

  @Test
  public void testSaveComicInfoXml() throws EntryLoaderException, IOException {
    byte[] result = adaptor.saveContent(comic);

    assertNotNull(result);

    Mockito.verify(comic, Mockito.times(1)).getPublisher();
    Mockito.verify(comic, Mockito.times(1)).getSeries();
    Mockito.verify(comic, Mockito.times(1)).getVolume();
    Mockito.verify(comic, Mockito.times(1)).getIssueNumber();
    Mockito.verify(comic, Mockito.times(1)).getTitle();
    Mockito.verify(comic, Mockito.times(1)).getSummary();
    Mockito.verify(comic, Mockito.times(1)).getNotes();
  }
}
