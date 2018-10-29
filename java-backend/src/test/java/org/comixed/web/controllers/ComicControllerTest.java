/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2018, The ComiXed Project.
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
 * along with this program. If not, see <http://www.gnu.org/licenses/>.package
 * org.comixed;
 */

package org.comixed.web.controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.Date;
import java.text.ParseException;
import java.util.List;

import org.comixed.library.model.Comic;
import org.comixed.repositories.ComicRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RunWith(MockitoJUnitRunner.class)
@SpringBootTest
public class ComicControllerTest
{
    private static final long TEST_COMIC_ID = 129;
    private static final String TEST_NONEXISTENT_FILE = "src/test/resources/this-file-doesnt-exist.cbz";
    private static final String TEST_DIRECTORY = "src/test/resources";
    private static final String TEST_COMIC_FILE = "src/test/resources/example.cbz";
    private static final long TEST_COMIC_COUNT = 320L;
    private static final String TEST_SERIES = "Awesome comic series";
    private static final String TEST_VOLUME = "2018";
    private static final String TEST_ISSUE_NUMBER = "52";

    @InjectMocks
    private ComicController controller;

    @Mock
    private ComicRepository comicRepository;

    @Mock
    private List<Comic> comicList;

    @Mock
    private Comic comic;

    @Test
    public void testGetComicsAddedSince() throws ParseException
    {
        Mockito.when(comicRepository.findByDateAddedGreaterThan(Mockito.any(Date.class))).thenReturn(comicList);

        List<Comic> result = controller.getComicsAddedSince(0L);

        Mockito.verify(comicRepository, Mockito.times(1)).findByDateAddedGreaterThan(new Date(0L));

        assertSame(comicList, result);
    }

    @Test
    public void testDeleteComicNonexistentComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertFalse(controller.deleteComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testDeleteComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.doNothing().when(comicRepository).delete(Mockito.any(Comic.class));

        assertTrue(controller.deleteComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comicRepository, Mockito.times(1)).delete(comic);
    }

    @Test
    public void testDownloadComicForNonexistentComic() throws FileNotFoundException, IOException
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(controller.downloadComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testDownloadComicFileDoesntExist() throws FileNotFoundException, IOException
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_NONEXISTENT_FILE);

        assertNull(controller.downloadComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    }

    @Test
    public void testDownloadComicFileIsDirectory() throws FileNotFoundException, IOException
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_DIRECTORY);

        assertNull(controller.downloadComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    }

    @Test
    public void testDownloadComic() throws IOException
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);

        ResponseEntity<InputStreamResource> result = controller.downloadComic(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(HttpStatus.OK, result.getStatusCode());
        assertTrue(result.getBody().contentLength() > 0);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    }

    @Test
    public void testGetComicForNonexistentComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(controller.getComic(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testGetComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);

        Comic result = controller.getComic(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(comic, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    }

    @Test
    public void testGetComicSummaryForNonexistentComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        assertNull(controller.getComicSummary(TEST_COMIC_ID));

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testGetComicSummary()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.when(comic.getFilename()).thenReturn(TEST_COMIC_FILE);

        Comic result = controller.getComicSummary(TEST_COMIC_ID);

        assertNotNull(result);
        assertSame(comic, result);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.atLeast(1)).getFilename();
    }

    @Test
    public void testGetComicCount()
    {
        Mockito.when(comicRepository.count()).thenReturn(TEST_COMIC_COUNT);

        long result = controller.getCount();

        assertEquals(TEST_COMIC_COUNT, result);

        Mockito.verify(comicRepository, Mockito.times(1)).count();
    }

    @Test
    public void testUpdateComicBadComicId()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(null);

        controller.updateComic(TEST_COMIC_ID, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
    }

    @Test
    public void testUpdateComic()
    {
        Mockito.when(comicRepository.findOne(Mockito.anyLong())).thenReturn(comic);
        Mockito.doNothing().when(comic).setSeries(Mockito.anyString());
        Mockito.doNothing().when(comic).setVolume(Mockito.anyString());
        Mockito.doNothing().when(comic).setIssueNumber(Mockito.anyString());
        Mockito.when(comicRepository.save(Mockito.any(Comic.class))).thenReturn(comic);

        controller.updateComic(TEST_COMIC_ID, TEST_SERIES, TEST_VOLUME, TEST_ISSUE_NUMBER);

        Mockito.verify(comicRepository, Mockito.times(1)).findOne(TEST_COMIC_ID);
        Mockito.verify(comic, Mockito.times(1)).setSeries(TEST_SERIES);
        Mockito.verify(comic, Mockito.times(1)).setVolume(TEST_VOLUME);
        Mockito.verify(comic, Mockito.times(1)).setIssueNumber(TEST_ISSUE_NUMBER);
        Mockito.verify(comicRepository, Mockito.times(1)).save(comic);
    }
}
