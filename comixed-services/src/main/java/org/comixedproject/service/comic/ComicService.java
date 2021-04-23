/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2019, The ComiXed Project.
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

package org.comixedproject.service.comic;

import static org.comixedproject.state.comic.ComicStateConstants.HEADER_COMIC;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.ComicDataAdaptor;
import org.comixedproject.model.comic.Comic;
import org.comixedproject.model.comic.ComicState;
import org.comixedproject.repositories.comic.ComicRepository;
import org.comixedproject.state.comic.ComicEvent;
import org.comixedproject.state.comic.ComicStateChangeListener;
import org.comixedproject.state.comic.ComicStateHandler;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.Message;
import org.springframework.statemachine.state.State;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>ComicService</code> provides business rules for instances of {@link Comic}.
 *
 * @author Darryl L. Pierce
 */
@Service
@Log4j2
public class ComicService implements InitializingBean, ComicStateChangeListener {
  @Autowired private ComicStateHandler comicStateHandler;
  @Autowired private ComicRepository comicRepository;
  @Autowired private ComicDataAdaptor comicDataAdaptor;

  /**
   * Retrieves a single comic by id. It is expected that this comic exists.
   *
   * @param id the comic id
   * @return the comic
   * @throws ComicException if the comic does not exist
   */
  public Comic getComic(final long id) throws ComicException {
    log.debug("Getting comic: id={}", id);

    final var result = this.doGetComic(id);
    final List<Comic> next =
        this.comicRepository.findIssuesAfterComic(
            result.getSeries(), result.getVolume(), result.getIssueNumber(), result.getCoverDate());
    if (!next.isEmpty()) {
      int index = 0;
      Comic nextComic = null;
      while (nextComic == null && index < next.size()) {
        Comic candidate = next.get(index);
        if (candidate.getCoverDate().compareTo(result.getCoverDate()) > 0) {
          log.debug("Found next issue by cover date: id={}", candidate.getId());
          nextComic = candidate;
        } else if ((candidate.getCoverDate().compareTo(result.getCoverDate()) == 0)
            && (candidate.getSortableIssueNumber().compareTo(result.getSortableIssueNumber())
                > 0)) {
          log.debug("Found next issue by issue number: id={}", candidate.getId());
          nextComic = candidate;
        } else {
          index++;
        }
      }
      if (nextComic != null) {
        log.debug("Setting the next comic: id={}", nextComic.getId());
        result.setNextIssueId(nextComic.getId());
      }
    }
    final List<Comic> prev =
        this.comicRepository.findIssuesBeforeComic(
            result.getSeries(), result.getVolume(), result.getIssueNumber(), result.getCoverDate());
    if (!prev.isEmpty()) {
      int index = prev.size() - 1;
      Comic prevComic = null;
      while (prevComic == null && index >= 0) {
        Comic candidate = prev.get(index);
        if (candidate.getCoverDate().compareTo(result.getCoverDate()) < 0) {
          log.debug("Found previous issue by cover date: id={}", candidate.getId());
          prevComic = candidate;
        } else if ((candidate.getCoverDate().compareTo(result.getCoverDate()) == 0)
            && (candidate.getSortableIssueNumber().compareTo(result.getSortableIssueNumber())
                < 0)) {
          log.debug("Found previous issue by issue number: id={}", candidate.getId());
          prevComic = candidate;
        } else {
          index--;
        }
      }
      if (prevComic != null) {
        log.debug("Setting previous comic: id={}", prevComic.getId());
        result.setPreviousIssueId(prevComic.getId());
      }
    }

    log.debug("Returning comic: id={}", result.getId());
    return result;
  }

  private Comic doGetComic(final long id) throws ComicException {
    final Comic result = this.comicRepository.getById(id);
    if (result == null) throw new ComicException("No such comic: id=" + id);
    return result;
  }

  /**
   * Marks a comic for deletion but does not actually delete the comic.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public Comic deleteComic(final long id) throws ComicException {
    log.debug("Marking comic for deletion: id={}", id);
    final var comic = this.doGetComic(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.addedToDeleteQueue);
    return this.doGetComic(id);
  }

  /**
   * Updates a comic record.
   *
   * @param id the comic id
   * @param update the updated comic data
   * @return the updated comic
   * @throws ComicException if the id is invalid
   */
  @Transactional
  public Comic updateComic(final long id, final Comic update) throws ComicException {
    log.debug("Updating comic: id={}", id);
    final var comic = this.doGetComic(id);

    log.debug("Updating the comic fields");

    comic.setPublisher(update.getPublisher());
    comic.setImprint(update.getImprint());
    comic.setSeries(update.getSeries());
    comic.setVolume(update.getVolume());
    comic.setIssueNumber(update.getIssueNumber());
    comic.setSortName(update.getSortName());
    comic.setScanType(update.getScanType());
    comic.setFormat(update.getFormat());

    this.comicStateHandler.fireEvent(comic, ComicEvent.detailsUpdated);
    return this.doGetComic(id);
  }

  /**
   * Saves a new comic.
   *
   * @param comic the comic
   * @return the saved comic
   */
  @Transactional
  public Comic save(final Comic comic) {
    log.debug("Saving comic: filename={}", comic.getFilename());

    final Comic result = this.comicRepository.save(comic);

    this.comicRepository.flush();

    return result;
  }

  /**
   * Retrieves the full content of the comic file.
   *
   * @param comic the comic
   * @return the comic content
   */
  @Transactional
  public byte[] getComicContent(final Comic comic) {
    log.debug("Getting file content: filename={}", comic.getFilename());

    try {
      return FileUtils.readFileToByteArray(new File(comic.getFilename()));
    } catch (IOException error) {
      log.error("Failed to read comic file content", error);
      return null;
    }
  }

  /**
   * Unmarks a comic for deletion.
   *
   * @param id the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public Comic restoreComic(final long id) throws ComicException {
    log.debug("Restoring comic: id={}", id);
    final var comic = this.doGetComic(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.removedFromDeleteQueue);
    return this.doGetComic(id);
  }

  /**
   * Deletes the specified comic from the library.
   *
   * @param comic the comic
   */
  @Transactional
  public void delete(final Comic comic) {
    log.debug("Deleting comic: id={}", comic.getId());
    this.comicRepository.delete(comic);
  }

  /**
   * Retrieves a page of comics to be moved.
   *
   * @param page the page
   * @param max the maximum number of comics to return
   * @return the list of comics
   */
  public List<Comic> findComicsToMove(final int page, final int max) {
    return this.comicRepository.findComicsToMove(PageRequest.of(page, max));
  }

  /**
   * Returns a comic with the given absolute filename.
   *
   * @param filename the filename
   * @return the comic
   */
  public Comic findByFilename(final String filename) {
    return this.comicRepository.findByFilename(filename);
  }

  /**
   * Returns a list of comics with ids greater than the threshold specified.
   *
   * @param threshold the id threshold
   * @param max the maximum number of records
   * @return the list of comics
   */
  public List<Comic> getComicsById(final long threshold, final int max) {
    log.debug("Finding {} comic{} with id greater than {}", max, max == 1 ? "" : "s", threshold);
    return this.comicRepository.findComicsWithIdGreaterThan(threshold, PageRequest.of(0, max));
  }

  @Override
  @Transactional
  public void onComicStateChange(
      final State<ComicState, ComicEvent> state, final Message<ComicEvent> message) {
    final var comic = message.getHeaders().get(HEADER_COMIC, Comic.class);
    if (comic == null) return;
    log.debug("Processing comic state change: [{}] =>  {}", comic.getId(), state.getId());
    comic.setComicState(state.getId());
    comic.setLastModifiedOn(new Date());
    this.comicRepository.save(comic);
  }

  @Override
  public void afterPropertiesSet() throws Exception {
    log.trace("Subscribing to comic state changes");
    this.comicStateHandler.addListener(this);
  }

  /**
   * Clears all metadata from the given comic.
   *
   * @param comicId the comic id
   * @return the updated comic
   * @throws ComicException if the comic id is invalid
   */
  @Transactional
  public Comic deleteMetadata(final long comicId) throws ComicException {
    log.debug("Loading comic: id={}", comicId);
    final var comic = this.doGetComic(comicId);
    log.trace("Clearing comic metadata");
    this.comicDataAdaptor.clear(comic);
    log.trace("Firing comic state event");
    this.comicStateHandler.fireEvent(comic, ComicEvent.metadataCleared);
    log.trace("Retrieving upated comic");
    return this.doGetComic(comicId);
  }
}
