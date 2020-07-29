/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2020, The ComiXed Project
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

package org.comixedproject.scrapers.comicvine.actions;

import static junit.framework.TestCase.assertEquals;

import java.io.IOException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.comixedproject.scrapers.ScrapingException;
import org.comixedproject.scrapers.comicvine.adaptors.ComicVineScrapingAdaptor;
import org.comixedproject.scrapers.comicvine.model.*;
import org.comixedproject.scrapers.model.ScrapingIssueDetails;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.ObjectFactory;

@RunWith(MockitoJUnitRunner.class)
public class ComicVineGetIssueDetailsActionTest {
  private static final String TEST_API_KEY = "This.Is.A.Test.Key";
  private static final Integer TEST_ISSUE_ID = 337;
  private static final String TEST_VOLUME_NAME = "Volume Name";
  private static final String TEST_PUBISHER_NAME = "Publisher Name";
  private static final String TEST_VOLUME_DETAILS_URL = "http://comicvine.gamespot.com/volume.url";
  private static final String TEST_PUBLISHER_DETAILS_API =
      "http://comicvine.gamespot.com/publisher_url";
  private static final String TEST_DESCRIPTION = "The issue description";
  private static final String TEST_START_YEAR = "2020";
  private static final String TEST_ISSUE_NUMBER = "23";
  private static final Date TEST_COVER_DATE = new Date();
  private static final String TEST_CHARACTER_NAME = "Character Name";
  private static final String TEST_TEAM_NAME = "Team Name";
  private static final String TEST_LOCATION_NAME = "Location Name";
  private static final String TEST_STORY_NAME = "Story Name";
  private static final String TEST_CREDIT_NAME = "Credit Name";
  private static final String TEST_CREDIT_ROLE = "Credit Role";

  @InjectMocks private ComicVineGetIssueDetailsAction scrapeComicAction;
  @Mock private ObjectFactory<ComicVineGetIssueWithDetailsAction> issueDetailsActionObjectFactory;
  @Mock private ComicVineGetIssueWithDetailsAction detailsAction;
  @Mock private ObjectFactory<ComicVineGetVolumeDetailsAction> volumeDetailsActionObjectFactory;
  @Mock private ComicVineGetVolumeDetailsAction volumeDetailsAction;

  @Mock
  private ObjectFactory<ComicVineGetPublisherDetailsAction> publisherDetailsActionObjectFactory;

  @Mock private ComicVineGetPublisherDetailsAction publisherDetailsAction;
  @Mock private ScrapingIssueDetails scrapingIssueDetails;
  @Mock private ComicVineIssue comicVineIssue;
  @Mock private ComicVineVolume comicVineVolume;
  @Mock private ComicVinePublisher comicVinePublisher;
  @Mock private ComicVineCharacter comicVineCharacter;
  @Mock private ComicVineTeam comicVineTeam;
  @Mock private ComicVineLocation comicVineLocation;
  @Mock private ComicVineStory comicVineStory;
  @Mock private ComicVineCredit comicVineCredit;

  private List<ComicVineCharacter> characters = new ArrayList<>();
  private List<ComicVineTeam> teams = new ArrayList<>();
  private List<ComicVineLocation> locations = new ArrayList<>();
  private List<ComicVineStory> stories = new ArrayList<>();
  private List<ComicVineCredit> credits = new ArrayList<>();

  @Before
  public void setUp() throws IOException, KeyStoreException, NoSuchAlgorithmException {
    scrapeComicAction.setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    scrapeComicAction.setApiKey(TEST_API_KEY);
    scrapeComicAction.setIssueId(TEST_ISSUE_ID);

    characters.add(comicVineCharacter);
    teams.add(comicVineTeam);
    locations.add(comicVineLocation);
    stories.add(comicVineStory);
    credits.add(comicVineCredit);

    Mockito.when(issueDetailsActionObjectFactory.getObject()).thenReturn(detailsAction);
    Mockito.when(volumeDetailsActionObjectFactory.getObject()).thenReturn(volumeDetailsAction);
    Mockito.when(publisherDetailsActionObjectFactory.getObject())
        .thenReturn(publisherDetailsAction);

    Mockito.when(comicVineIssue.getVolume()).thenReturn(comicVineVolume);
    Mockito.when(comicVineIssue.getCoverDate()).thenReturn(TEST_COVER_DATE);
    Mockito.when(comicVineIssue.getIssueNumber()).thenReturn(TEST_ISSUE_NUMBER);
    Mockito.when(comicVineIssue.getDescription()).thenReturn(TEST_DESCRIPTION);

    Mockito.when(comicVineVolume.getPublisher()).thenReturn(comicVinePublisher);
    Mockito.when(comicVineVolume.getDetailUrl()).thenReturn(TEST_VOLUME_DETAILS_URL);
    Mockito.when(comicVineVolume.getName()).thenReturn(TEST_VOLUME_NAME);
    Mockito.when(comicVineVolume.getStartYear()).thenReturn(TEST_START_YEAR);

    Mockito.when(comicVinePublisher.getName()).thenReturn(TEST_PUBISHER_NAME);
    Mockito.when(comicVinePublisher.getDetailUrl()).thenReturn(TEST_PUBLISHER_DETAILS_API);

    Mockito.when(comicVineIssue.getCharacters()).thenReturn(characters);
    Mockito.when(comicVineCharacter.getName()).thenReturn(TEST_CHARACTER_NAME);
    Mockito.when(comicVineIssue.getTeams()).thenReturn(teams);
    Mockito.when(comicVineTeam.getName()).thenReturn(TEST_TEAM_NAME);
    Mockito.when(comicVineIssue.getLocations()).thenReturn(locations);
    Mockito.when(comicVineLocation.getName()).thenReturn(TEST_LOCATION_NAME);
    Mockito.when(comicVineIssue.getStories()).thenReturn(stories);
    Mockito.when(comicVineStory.getName()).thenReturn(TEST_STORY_NAME);
    Mockito.when(comicVineIssue.getPeople()).thenReturn(credits);
    Mockito.when(comicVineCredit.getName()).thenReturn(TEST_CREDIT_NAME);
    Mockito.when(comicVineCredit.getRole()).thenReturn(TEST_CREDIT_ROLE);
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteFailsWithoutApiKey() throws ScrapingException {
    scrapeComicAction.setApiKey("");
    scrapeComicAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteFailsWithoutIssueId() throws ScrapingException {
    scrapeComicAction.setIssueId(null);
    scrapeComicAction.execute();
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteGetIssueDetailsThrowsException() throws ScrapingException {
    Mockito.when(detailsAction.execute()).thenThrow(ScrapingException.class);

    try {
      scrapeComicAction.execute();
    } finally {
      this.verifyGetIssueDetailsAction();
    }
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteGetVolumeDetailsThrowsException() throws ScrapingException {
    Mockito.when(detailsAction.execute()).thenReturn(comicVineIssue);
    Mockito.when(volumeDetailsAction.execute()).thenThrow(ScrapingException.class);

    try {
      scrapeComicAction.execute();
    } finally {
      this.verifyGetIssueDetailsAction();
      this.verifyGetVolumeDetailsAction();
    }
  }

  @Test(expected = ScrapingException.class)
  public void testExecuteGetPublisherDetailsThrowsException() throws ScrapingException {
    Mockito.when(detailsAction.execute()).thenReturn(comicVineIssue);
    Mockito.when(volumeDetailsAction.execute()).thenReturn(comicVineVolume);
    Mockito.when(publisherDetailsAction.execute()).thenThrow(ScrapingException.class);

    try {
      scrapeComicAction.execute();
    } finally {
      this.verifyGetIssueDetailsAction();
      this.verifyGetVolumeDetailsAction();
      this.verifyGetPublisherDetailsAction();
    }
  }

  @Test
  public void testExecute() throws ScrapingException {
    Mockito.when(detailsAction.execute()).thenReturn(comicVineIssue);
    Mockito.when(volumeDetailsAction.execute()).thenReturn(comicVineVolume);
    Mockito.when(publisherDetailsAction.execute()).thenReturn(comicVinePublisher);

    final ScrapingIssueDetails result = scrapeComicAction.execute();

    this.verifyGetIssueDetailsAction();
    this.verifyGetVolumeDetailsAction();
    this.verifyGetPublisherDetailsAction();

    assertEquals(TEST_PUBISHER_NAME, result.getPublisher());
    assertEquals(TEST_VOLUME_NAME, result.getSeries());
    assertEquals(TEST_START_YEAR, result.getVolume());
    assertEquals(TEST_ISSUE_NUMBER, result.getIssueNumber());
    assertEquals(TEST_COVER_DATE, result.getCoverDate());
    assertEquals(TEST_DESCRIPTION, result.getDescription());

    assertFalse(result.getCharacters().isEmpty());
    for (String character : result.getCharacters()) {
      assertEquals(TEST_CHARACTER_NAME, character);
    }
    assertFalse(result.getTeams().isEmpty());
    for (String team : result.getTeams()) {
      assertEquals(TEST_TEAM_NAME, team);
    }
    assertFalse(result.getLocations().isEmpty());
    for (String location : result.getLocations()) {
      assertEquals(TEST_LOCATION_NAME, location);
    }
    assertFalse(result.getStories().isEmpty());
    for (String story : result.getStories()) {
      assertEquals(TEST_STORY_NAME, story);
    }
    assertFalse(result.getCredits().isEmpty());
    for (ScrapingIssueDetails.CreditEntry credit : result.getCredits()) {
      assertEquals(TEST_CREDIT_NAME, credit.getName());
      assertEquals(TEST_CREDIT_ROLE, credit.getRole());
    }
  }

  private void assertFalse(final boolean empty) {}

  private void verifyGetPublisherDetailsAction() throws ScrapingException {
    Mockito.verify(publisherDetailsActionObjectFactory, Mockito.times(1)).getObject();
    Mockito.verify(publisherDetailsAction, Mockito.times(1)).setApiUrl(TEST_PUBLISHER_DETAILS_API);
    Mockito.verify(publisherDetailsAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(publisherDetailsAction, Mockito.times(1)).execute();
  }

  private void verifyGetVolumeDetailsAction() throws ScrapingException {
    Mockito.verify(volumeDetailsActionObjectFactory, Mockito.times(1)).getObject();
    Mockito.verify(volumeDetailsAction, Mockito.times(1)).setApiUrl(TEST_VOLUME_DETAILS_URL);
    Mockito.verify(volumeDetailsAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(volumeDetailsAction, Mockito.times(1)).execute();
  }

  private void verifyGetIssueDetailsAction() throws ScrapingException {
    Mockito.verify(issueDetailsActionObjectFactory, Mockito.times(1)).getObject();
    Mockito.verify(detailsAction, Mockito.times(1)).setBaseUrl(ComicVineScrapingAdaptor.BASE_URL);
    Mockito.verify(detailsAction, Mockito.times(1)).setApiKey(TEST_API_KEY);
    Mockito.verify(detailsAction, Mockito.times(1)).setIssueId(TEST_ISSUE_ID);
    Mockito.verify(detailsAction, Mockito.times(1)).execute();
  }
}
