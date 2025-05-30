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

import io.micrometer.core.annotation.Timed;
import lombok.extern.log4j.Log4j2;
import org.comixedproject.reader.ReaderUtil;
import org.comixedproject.reader.model.DirectoryEntry;
import org.comixedproject.reader.model.LoadDirectoryResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <code>LibraryReaderController</code> provides the root controller for navigating the library from
 * a reader.
 *
 * @author Darryl L. Pierce
 */
@RestController
@Log4j2
public class LibraryReaderController {
  public static final String ALL_COMICS = "All Comics";
  public static final String UNREAD_COMICS = "Unread Comics";
  public static final String READING_LISTS = "Reading Lists";
  public static final String PUBLISHERS = "All Publishers";
  public static final String SERIES = "All Series";
  public static final String CHARACTERS = "Characters";
  public static final String TEAMS = "Teams";
  public static final String LOCATIONS = "Locations";
  public static final String STORY_ARCS = "Story Arcs";
  static final String API_ROOT = "/reader/v1";
  public static final String ALL_COMICS_URL = String.format("%s/all?unread=false", API_ROOT);
  public static final String UNREAD_COMICS_URL = String.format("%s/all?unread=true", API_ROOT);
  public static final String READING_LISTS_URL = String.format("%s/lists/reading", API_ROOT);
  static final String COMIC_DOWNLOAD_URL = API_ROOT + "/comics/%d/download";

  /**
   * Returns the root directory for the library.
   *
   * @return the directory response
   */
  @GetMapping(value = API_ROOT + "/root", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-root")
  public LoadDirectoryResponse getRoot() {
    log.info("Returning root navigation entries");
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .add(new DirectoryEntry(ReaderUtil.generateId("all-comics"), ALL_COMICS, ALL_COMICS_URL));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("unread-comics"), UNREAD_COMICS, UNREAD_COMICS_URL));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("reading-lists"), READING_LISTS, READING_LISTS_URL));
    return result;
  }

  @GetMapping(value = API_ROOT + "/all", produces = MediaType.APPLICATION_JSON_VALUE)
  @PreAuthorize("hasRole('READER')")
  @Timed(value = "comixed.reader.library.get-all")
  public LoadDirectoryResponse getAll(
      @RequestParam(name = "unread", required = false, defaultValue = "false")
          final String unreadParam) {
    final boolean unread = Boolean.parseBoolean(unreadParam);
    log.info("Returning all comic categories", unread);
    final LoadDirectoryResponse result = new LoadDirectoryResponse();
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("publishers"),
                PUBLISHERS,
                String.format("%s?unread=%s", API_ROOT + "/collections/publishers", unread)));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("series"),
                SERIES,
                String.format("%s?unread=%s", API_ROOT + "/collections/series", unread)));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("characters"),
                CHARACTERS,
                String.format("%s?unread=%s", API_ROOT + "/collections/characters", unread)));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("teams"),
                TEAMS,
                String.format("%s?unread=%s", API_ROOT + "/collections/teams", unread)));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("locations"),
                LOCATIONS,
                String.format("%s?unread=%s", API_ROOT + "/collections/locations", unread)));
    result
        .getContents()
        .add(
            new DirectoryEntry(
                ReaderUtil.generateId("stories"),
                STORY_ARCS,
                String.format("%s?unread=%s", API_ROOT + "/collections/stories", unread)));

    return result;
  }
}
