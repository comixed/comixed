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

package org.comixedproject.adaptors.content;

import static junit.framework.TestCase.assertFalse;
import static junit.framework.TestCase.assertNotNull;

import java.io.IOException;
import java.util.*;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.Credit;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ComicMetadataContentAdaptorTest extends BaseContentAdaptorTest {
  private static final String TEST_COMICINFO_FILE_COMPLETE =
      "src/test/resources/ComicInfo-complete.xml";
  private static final String TEST_COMICINFO_FILE_NOT_XML =
      "src/test/resources/application.properties";
  private static final String TEST_PUBLISHER_NAME = "Test Publisher";
  private static final String TEST_SERIES_NAME = "Test Series";
  private static final String TEST_VOLUME_NAME = "2011";
  private static final String TEST_ISSUE_NUMBER = "24";
  private static final String TEST_TITLE = "Test Title";
  private static final String TEST_DESCRIPTION = "Test summary <em>inner tag</em>";

  @InjectMocks ComicMetadataContentAdaptor adaptor;
  @Mock private Comic comic;
  private List<String> characterList = new ArrayList<>();
  private List<String> teamList = new ArrayList<>();
  private List<String> locationList = new ArrayList<>();
  private List<String> storyList = new ArrayList<>();
  private Set<Credit> creditList = new HashSet<>();

  @Before
  public void setup() {
    Mockito.when(comic.getPublisher()).thenReturn(TEST_PUBLISHER_NAME);
    Mockito.when(comic.getSeries()).thenReturn(TEST_SERIES_NAME);
    Mockito.when(comic.getVolume()).thenReturn(TEST_VOLUME_NAME);
    Mockito.when(comic.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(comic.getTitle()).thenReturn(TEST_TITLE);
    Mockito.when(comic.getDescription()).thenReturn(TEST_DESCRIPTION);
    Mockito.when(comic.getCoverDate()).thenReturn(new Date());

    Mockito.when(comic.getCharacters()).thenReturn(characterList);
    Mockito.when(comic.getTeams()).thenReturn(teamList);
    Mockito.when(comic.getLocations()).thenReturn(locationList);
    Mockito.when(comic.getStories()).thenReturn(storyList);
    Mockito.when(comic.getCredits()).thenReturn(creditList);
  }

  @Test(expected = ContentAdaptorException.class)
  public void testLoadComicInfoXmlNotXml() throws IOException, ContentAdaptorException {
    adaptor.loadContent(comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_NOT_XML));
  }

  @Test
  public void testLoadComicInfoXml() throws IOException, ContentAdaptorException {
    adaptor.loadContent(
        comic, TEST_COMICINFO_FILE_COMPLETE, loadFile(TEST_COMICINFO_FILE_COMPLETE));

    assertFalse(characterList.isEmpty());
    assertFalse(teamList.isEmpty());
    assertFalse(locationList.isEmpty());
    assertFalse(storyList.isEmpty());
    assertFalse(creditList.isEmpty());

    Mockito.verify(comic, Mockito.times(1)).setPublisher(TEST_PUBLISHER_NAME);
    Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES_NAME);
    Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME_NAME);
    Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
    Mockito.verify(comic, Mockito.times(1)).setTitle(TEST_TITLE);
    Mockito.verify(comic, Mockito.times(1)).setDescription(TEST_DESCRIPTION);
  }

  @Test
  public void testCreateContent() throws ContentAdaptorException, IOException {
    final Object[] roles = ComicMetadataContentAdaptor.CREDIT_TO_ROLE.keySet().toArray();
    for (int index = 0; index < 25; index++) {
      characterList.add("CHAR" + index);
      teamList.add("TEAM" + index);
      locationList.add("LOC" + index);
      storyList.add("STORY" + index);
      creditList.add(new Credit(comic, "NAME" + index, roles[index % roles.length].toString()));
    }
    byte[] result = adaptor.createContent(comic);

    assertNotNull(result);

    Mockito.verify(comic, Mockito.times(1)).getPublisher();
    Mockito.verify(comic, Mockito.times(1)).getSeries();
    Mockito.verify(comic, Mockito.times(1)).getVolume();
    Mockito.verify(comic, Mockito.times(1)).getIssueNumber();
    Mockito.verify(comic, Mockito.times(1)).getTitle();
    Mockito.verify(comic, Mockito.times(1)).getDescription();
  }
}
