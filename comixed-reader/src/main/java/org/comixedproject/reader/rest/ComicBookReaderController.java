/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2025, The ComiXed Project
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

package org.comixedproject.reader.rest;

import static org.comixedproject.reader.rest.LibraryReaderController.API_ROOT;
import static org.comixedproject.reader.rest.LibraryReaderController.COMIC_DOWNLOAD_URL;

import io.micrometer.core.annotation.Timed;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.security.Principal;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.adaptors.encoders.WebResponseEncoder;
import org.comixedproject.model.comicbooks.ComicBook;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.comixedproject.reader.service.DirectoryReaderService;
import org.comixedproject.reader.service.ReaderException;
import org.comixedproject.service.comicbooks.ComicBookException;
import org.comixedproject.service.comicbooks.ComicBookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>PublisherReaderController</code> provides endpoints for loading directories relating to
 * comic books.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class ComicBookReaderController {
  @Autowired private DirectoryReaderService directoryReaderService;
  @Autowired private ComicBookService comicBookService;
  @Autowired private WebResponseEncoder webResponseEncoder;

  /**
   * Returns all comics for a given publisher, series, and volume. If the unread parameter is
   * present then only those comics that are unread are returned.
   *
   * @param principal the user principal
   * @param publisherParam the publisher's name
   * @param seriesParam the series' name
   * @param volumeParam the volume
   * @param unreadParam the unread flag
   * @return the publishers
   */
  @GetMapping(
      value = API_ROOT + "/collections/publishers/{publisher}/series/{series}/volumes/{volume}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-comics")
  public LoadDirectoryResponse getComicsForPublisherAndSeriesAndVolume(
      final Principal principal,
      @PathVariable("publisher") final String publisherParam,
      @PathVariable("series") final String seriesParam,
      @PathVariable("volume") final String volumeParam,
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final String email = principal.getName();
    final String publisher = ReaderUtil.urlDecode(publisherParam);
    final String series = ReaderUtil.urlDecode(seriesParam);
    final String volume = ReaderUtil.urlDecode(volumeParam);
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info(
        "Loading comics: email={} unread={} publisher={} series={} volume={}",
        email,
        unread,
        publisher,
        series,
        volume);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .addAll(
            directoryReaderService.getAllComicsForPublisherAndSeriesAndVolume(
                email, unread, publisher, series, volume, COMIC_DOWNLOAD_URL));
    return result;
  }

  /**
   * Returns all volumes for a given publisher and series. If the unread parameter is present then
   * only those publishers with unread comics are returned.
   *
   * @param comicBookId the comic book id
   * @return the comic book content
   * @throws ComicBookException if the id is invalid
   */
  @GetMapping(value = API_ROOT + "/comics/{comicBookId}/download")
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.download-comic")
  public ResponseEntity<InputStreamResource> downloadComic(
      @PathVariable("comicBookId") final long comicBookId) throws Exception {
    try {
      log.info("Downloading comicBook: id={}", comicBookId);
      ComicBook comicBook = this.comicBookService.getComic(comicBookId);
      log.trace("Returning encoded file: {}", comicBook.getComicDetail().getFilename());
      return this.webResponseEncoder.encode(
          (int) comicBook.getComicDetail().getFile().length(),
          new InputStreamResource(new FileInputStream(comicBook.getComicDetail().getFile())),
          comicBook.getComicDetail().getBaseFilename(),
          MediaType.parseMediaType(comicBook.getComicDetail().getArchiveType().getMimeType()));
    } catch (ComicBookException | FileNotFoundException error) {
      throw new ReaderException("Failed to download comic: id=" + comicBookId, error);
    }
  }
}
