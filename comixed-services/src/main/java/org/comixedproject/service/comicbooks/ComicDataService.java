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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.*;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.comixedproject.adaptors.file.FileTypeAdaptor;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicDataSet;
import org.comixedproject.model.comicbooks.ComicType;
import org.comixedproject.model.comicpages.ComicPage;
import org.comixedproject.model.library.DisplayableComic;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.model.net.comicbooks.PageOrderEntry;
import org.comixedproject.service.comicpages.ComicPageService;
import org.comixedproject.service.library.DisplayableComicService;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateAdaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * <code>ComicDataService</code> provides methods for working with instances of {@link
 * DisplayableComic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicDataService {
  @Autowired private DisplayableComicService displayableComicService;
  @Autowired private ComicService comicService;
  @Autowired private ComicPageService comicPageService;
  @Autowired private ComicMetadataSourceService comicMetadataSourceService;
  @Autowired private ComicTagService comicTagService;
  @Autowired private ImprintService imprintService;
  @Autowired private ComicStateAdaptor comicStateAdaptor;
  @Autowired private FileTypeAdaptor fileTypeAdaptor;

  /**
   * Retrieves a single comic's data.
   *
   * @param comicId the comic id
   * @return the comic's data
   * @throws ComicException if the id is invalid
   */
  public ComicDataSet getComic(final long comicId) throws ComicException {
    log.debug("Loading comic: id={}", comicId);
    return this.doLoadComicBookData(comicId);
  }

  /**
   * Returns the file content and details for a comic.
   *
   * @param comicId the comic id
   * @return the content
   * @throws ComicException if the id is invalid
   */
  public DownloadDocument getComicContent(final long comicId) throws ComicException {
    log.debug("Loading contents for file: {}", comicId);
    final Comic comic = this.comicService.getComic(comicId);
    final String filename = comic.getFilename();
    final String baseFilename = FilenameUtils.getName(filename);

    try {
      log.debug("Loading contents from file: {}", filename);
      final byte[] content = FileUtils.readFileToByteArray(new File(filename));
      return new DownloadDocument(
          baseFilename,
          this.fileTypeAdaptor.getMimeTypeFor(new ByteArrayInputStream(content)),
          content);
    } catch (IOException error) {
      throw new ComicException("Failed to load comic file content", error);
    }
  }

  /**
   * Saves the updated order of pages, updating each page's record.
   *
   * @param comicId the comic id
   * @param pageOrderEntryList the newly ordered pages
   * @throws ComicException if the comic id is invalid
   */
  public void savePageOrder(final long comicId, final List<PageOrderEntry> pageOrderEntryList)
      throws ComicException {
    log.trace("Loading comic: id={}", comicId);
    final Comic comic = this.comicService.getComic(comicId);
    log.trace("Sorting new page list");
    pageOrderEntryList.sort(Comparator.comparingInt(PageOrderEntry::getPosition));
    log.trace("Checking for holes in order");
    for (int index = 0; index < pageOrderEntryList.size(); index++) {
      final PageOrderEntry entry = pageOrderEntryList.get(index);
      if (entry.getPosition() != index)
        throw new ComicException(
            String.format("Invalid page order list: %d != %d", index, entry.getPosition()));
    }

    log.trace("Applying order");
    for (int index = 0; index < comic.getPages().size(); index++) {
      final ComicPage page = comic.getPages().get(index);
      if (Objects.nonNull(page)) {
        final Optional<PageOrderEntry> position =
            pageOrderEntryList.stream()
                .filter(pageOrderEntry -> pageOrderEntry.getFilename().equals(page.getFilename()))
                .findFirst();
        if (position.isEmpty())
          throw new ComicException(
              String.format("No such order entry: filename=%s", page.getFilename()));
        log.trace("Applying position");
        page.setPageNumber(position.get().getPosition());
      }
    }

    log.trace("Firing event: details updated");
    this.comicStateAdaptor.fireEvent(comic, ComicEvent.comicMetadataChanged);
  }

  public ComicDataSet updateComic(
      final long comicId,
      final ComicType comicType,
      final String publisher,
      final String series,
      final String volume,
      final String issueNumber,
      final String imprint,
      final String sortName,
      final String title,
      final Date coverDate,
      final Date storeDate)
      throws ComicException {
    log.debug("Updating comic: id={}", comicId);
    try {
      final Comic comic = this.comicService.getByComicBookId(comicId);

      log.trace("Updating the comic fields");

      if (Objects.nonNull(comicType)) {
        comic.setComicType(comicType);
      }
      comic.setPublisher(publisher);
      comic.setSeries(series);
      comic.setVolume(volume);
      comic.setIssueNumber(issueNumber);
      if (StringUtils.hasLength(imprint)) {
        comic.setImprint(imprint);
      }
      if (StringUtils.hasLength(sortName)) {
        comic.setSortName(sortName);
      }
      if (StringUtils.hasLength(title)) {
        comic.setTitle(title);
      }
      if (Objects.nonNull(coverDate)) {
        comic.setCoverDate(coverDate);
      }
      if (Objects.nonNull(storeDate)) {
        comic.setStoreDate(storeDate);
      }

      this.imprintService.update(comic);

      this.comicStateAdaptor.fireEvent(comic, ComicEvent.comicMetadataChanged);
      return this.doLoadComicBookData(comicId);
    } catch (ComicException error) {
      throw new ComicException("Failed to update comic metadata", error);
    }
  }

  /**
   * Marks a comic for removal from the library.
   *
   * @param comicId the comic id
   * @throws ComicException
   */
  public void deleteComicBook(final long comicId) throws ComicException {
    log.debug("Marking comic for removal: id={}", comicId);
    doFireEvent(comicId, ComicEvent.markComicForRemoval);
  }

  /**
   * Unmarks a comic for removal from the library.
   *
   * @param comicId the comic id
   * @throws ComicException
   */
  public void undeleteComicBook(final long comicId) throws ComicException {
    log.debug("Unmarking comic for removal: id={}", comicId);
    doFireEvent(comicId, ComicEvent.unmarkComicForRemoval);
  }

  /**
   * Marks all comics in a given id list for removal.
   *
   * @param comicIdList the comic id list
   * @throws ComicException if any of the ids are invalid
   */
  @Transactional(rollbackFor = Exception.class)
  public void deleteComicBooksById(final List<Long> comicIdList) throws ComicException {
    for (int index = 0; index < comicIdList.size(); index++) {
      this.doFireEvent(comicIdList.get(index), ComicEvent.markComicForRemoval);
    }
  }

  /**
   * Unmarks all comics in a given id list for removal.
   *
   * @param comicIdList the comic id list
   * @throws ComicException if any of the ids are invalid
   */
  public void undeleteComicBooksById(final List<Long> comicIdList) throws ComicException {
    for (int index = 0; index < comicIdList.size(); index++) {
      this.doFireEvent(comicIdList.get(index), ComicEvent.unmarkComicForRemoval);
    }
  }

  private void doFireEvent(final long comicId, final ComicEvent event) throws ComicException {
    log.debug("Firing comic event: id={} event={}", comicId, event);
    try {
      final Comic comic = this.comicService.getByComicBookId(comicId);
      this.comicStateAdaptor.fireEvent(comic, event);
    } catch (ComicException error) {
      throw new ComicException(
          String.format("Failed to fire comic event: id=%d event=%s", comicId, event), error);
    }
  }

  private ComicDataSet doLoadComicBookData(final long comicId) throws ComicException {
    return new ComicDataSet(
        this.displayableComicService.getForComicBookId(comicId),
        this.comicPageService.getPagesForComicBook(comicId),
        this.comicMetadataSourceService.getMetadataForComicBook(comicId),
        this.comicTagService.getTagsForComicBook(comicId));
  }
}
