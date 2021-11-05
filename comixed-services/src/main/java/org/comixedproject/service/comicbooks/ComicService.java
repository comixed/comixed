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

package org.comixedproject.service.comicbooks;

import static org.comixedproject.state.comicbooks.ComicStateHandler.HEADER_COMIC;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixedproject.adaptors.comicbooks.ComicDataAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicbooks.PublishComicUpdateAction;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.comixedproject.repositories.comicbooks.ComicRepository;
import org.comixedproject.state.comicbooks.ComicEvent;
import org.comixedproject.state.comicbooks.ComicStateChangeListener;
import org.comixedproject.state.comicbooks.ComicStateHandler;
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
  @Autowired private PublishComicUpdateAction publishComicUpdateAction;
  @Autowired private ImprintService imprintService;

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
    final Optional<Comic> nextComic =
        this.comicRepository
            .findIssuesAfterComic(
                result.getSeries(),
                result.getVolume(),
                result.getIssueNumber(),
                result.getCoverDate())
            .stream()
            .filter(comic -> comic.getCoverDate().compareTo(result.getCoverDate()) >= 0)
            .sorted((o1, o2) -> o1.getCoverDate().compareTo(o2.getCoverDate()))
            .findFirst();
    if (nextComic.isPresent()) result.setNextIssueId(nextComic.get().getId());

    final Optional<Comic> prevComic =
        this.comicRepository
            .findIssuesBeforeComic(
                result.getSeries(),
                result.getVolume(),
                result.getIssueNumber(),
                result.getCoverDate())
            .stream()
            .filter(comic -> comic.getCoverDate().compareTo(result.getCoverDate()) <= 0)
            .sorted((o1, o2) -> o2.getCoverDate().compareTo(o1.getCoverDate()))
            .findFirst();
    if (prevComic.isPresent()) result.setPreviousIssueId(prevComic.get().getId());

    log.debug("Returning comic: id={}", result.getId());
    return result;
  }

  private Comic doGetComic(final long id, final boolean throwIfMissing) throws ComicException {
    final Comic result = this.comicRepository.getById(id);
    if (result == null && throwIfMissing) throw new ComicException("No such comic: id=" + id);
    return result;
  }

  private Comic doGetComic(final long id) throws ComicException {
    return this.doGetComic(id, true);
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
    final var comic = this.comicRepository.getByIdWithReadingLists(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.deleteComic);
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

    log.trace("Updating the comic fields");

    comic.setPublisher(update.getPublisher());
    comic.setSeries(update.getSeries());
    comic.setVolume(update.getVolume());
    comic.setIssueNumber(update.getIssueNumber());
    comic.setComicVineId(update.getComicVineId());
    comic.setImprint(update.getImprint());
    comic.setSortName(update.getSortName());
    comic.setTitle(update.getTitle());
    comic.setDescription(update.getDescription());

    this.imprintService.update(comic);

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

    this.imprintService.update(comic);

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
  public Comic undeleteComic(final long id) throws ComicException {
    log.debug("Restoring comic: id={}", id);
    final var comic = this.doGetComic(id);
    this.comicStateHandler.fireEvent(comic, ComicEvent.undeleteComic);
    return this.doGetComic(id);
  }

  /**
   * Deletes the specified comic from the library.
   *
   * @param comic the comic
   */
  @Transactional
  public void deleteComic(final Comic comic) {
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
    final Comic updated = this.comicRepository.save(comic);
    log.trace("Publishing updated comic");
    try {
      this.publishComicUpdateAction.publish(updated);
    } catch (PublishingException error) {
      log.error("Failed to publish comic update", error);
    }
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

  /**
   * Retrieves inserted comics that have not been processed.
   *
   * @return the comics
   */
  public List<Comic> findInsertedComics() {
    log.trace("Loading newly inserted comics");
    return this.comicRepository.findForState(ComicState.ADDED);
  }

  /**
   * Retrieves the number of unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutContentCount() {
    log.trace("Getting the number of unprocessed comics without content");
    return this.comicRepository.findUnprocessedComicsWithoutContent().size();
  }

  /**
   * Retrieves unprocessed comics that are waiting to have their contents loaded.
   *
   * @return the comics
   */
  public List<Comic> findUnprocessedComicsWithoutContent() {
    log.trace("Loading unprocessed comics that need to have their contents loaded");
    return this.comicRepository.findUnprocessedComicsWithoutContent();
  }

  /**
   * Returns the number of unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @return the count
   */
  public long getUnprocessedComicsForMarkedPageBlockingCount() {
    log.trace("Getting unprocessed comics that need page blocking count");
    return this.comicRepository.findUnprocessedComicsForMarkedPageBlocking().size();
  }

  /**
   * Retrieves unprocessed comics that are waiting to have the blocked pages marked.
   *
   * @return the comics
   */
  public List<Comic> findUnprocessedComicsForMarkedPageBlocking() {
    log.trace("Loading unprocessed comics that need page blocking");
    return this.comicRepository.findUnprocessedComicsForMarkedPageBlocking();
  }

  /**
   * Returns the number of unprocessed comics that don't have file details loaded.
   *
   * @return the count
   */
  public long getUnprocessedComicsWithoutFileDetailsCount() {
    log.trace("Getting unprocessed comics without file details loaded count");
    return this.comicRepository.findUnprocessedComicsWithoutFileDetails().size();
  }

  /**
   * Retrieves unprocessed comics that don't have file details.
   *
   * @return the comics
   */
  public List<Comic> findUnprocessedComicsWithoutFileDetails() {
    log.trace("Loading unprocessed comics without file details loaded");
    return this.comicRepository.findUnprocessedComicsWithoutFileDetails();
  }

  /**
   * Returns the number of unprocessed comics that have had their contents processed.
   *
   * @return the count
   */
  public long getProcessedComicsCount() {
    log.trace("Getting count of unprocessed comics that are fully processed");
    return this.comicRepository.findProcessedComics().size();
  }

  /**
   * Retrieves unprocessed comics that have had their contents processed.
   *
   * @return the comics
   */
  public List<Comic> findProcessedComics() {
    log.trace("Loading unprocessed comics that are fully processed");
    return this.comicRepository.findProcessedComics();
  }

  /**
   * Marks a set of comics for rescanning.
   *
   * @param ids the comic ids
   */
  public void rescanComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          try {
            log.trace("Loading comic: id={}", id);
            final Comic comic = this.doGetComic(id);
            log.trace("Firing event: rescan comic");
            this.comicStateHandler.fireEvent(comic, ComicEvent.rescanComic);
          } catch (ComicException error) {
            log.error("Error preparing comic for rescan", error);
          }
        });
  }

  /**
   * Returns the number of records with the specified state.
   *
   * @param state the target state
   * @return the number of records
   */
  public int getCountForState(final ComicState state) {
    log.trace("Getting record count for state: {}", state);
    return this.comicRepository.findForState(state).size();
  }

  /**
   * Returns comics that are waiting to have their metadata updated.
   *
   * @return the list of comics
   */
  public List<Comic> findComicsWithMetadataToUpdate() {
    log.trace("Getting comics that are ready to have their metadata updated");
    return this.comicRepository.findComicsWithMetadataToUpdate();
  }

  /**
   * Finds all comics marked for deletion.
   *
   * @return the list of comics
   */
  public List<Comic> findComicsMarkedForDeletion() {
    log.trace("Finding all comics marked for deletion");
    return this.comicRepository.findComicsMarkedForDeletion();
  }

  /**
   * Finds all comics that are to be moved.
   *
   * @return the list of comics
   */
  public List<Comic> findComicsToBeMoved() {
    log.trace("Finding all comics to be moved");
    return this.comicRepository.findComicsToBeMoved();
  }

  /**
   * Returns all comics.
   *
   * @return the list of comics
   */
  public List<Comic> findAll() {
    log.trace("Finding all comics");
    return this.comicRepository.findAll();
  }

  /**
   * Marks comics for deletion.
   *
   * @param ids the comic ids
   */
  public void deleteComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          final Comic comic = this.comicRepository.getByIdWithReadingLists(id);
          if (comic != null) {
            log.trace("Marking comic for deletion: id={}", comic.getId());
            this.comicStateHandler.fireEvent(comic, ComicEvent.deleteComic);
          }
        });
  }

  /**
   * Unmarks comics for deletion.
   *
   * @param ids the comic ids
   */
  public void undeleteComics(final List<Long> ids) {
    ids.forEach(
        id -> {
          final Comic comic = this.comicRepository.getById(id.longValue());
          if (comic != null) {
            log.trace("Unmarking comic for deletion: id={}", comic.getId());
            this.comicStateHandler.fireEvent(comic, ComicEvent.undeleteComic);
          }
        });
  }

  /**
   * Finds all comics to be recreated.
   *
   * @return the list of comics
   */
  public List<Comic> findComicsToRecreate() {
    log.trace("Finding all comics to be recreated");
    return this.comicRepository.findComicsToRecreate();
  }

  /**
   * Looks for the first existing comic that matches the given criteria.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param issueNumber the issue number
   * @return the comic
   */
  public Comic findComic(
      final String publisher, final String series, final String volume, final String issueNumber) {
    log.trace(
        "Finding comic: publisher={} series={} volume={} issue #={}",
        publisher,
        series,
        volume,
        issueNumber);
    return this.comicRepository.findComic(publisher, series, volume, issueNumber);
  }

  /**
   * Returns the list of all publisher names.
   *
   * @return the list of names.
   */
  public List<String> getAllPublishers() {
    log.trace("Loading all publisher names");
    return this.comicRepository.findDistinctPublishers();
  }

  /**
   * Returns all comics for a single publisher by name.
   *
   * @param name the publisher's name
   * @return the comics
   */
  public List<Comic> getAllForPublisher(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicRepository.findAllByPublisher(name);
  }

  /**
   * Returns the list of all series names.
   *
   * @return the list of names.
   */
  public List<String> getAllSeries() {
    log.trace("Loading all publisher names");
    return this.comicRepository.findDistinctSeries();
  }

  /**
   * Returns all comics for a single series by name.
   *
   * @param name the series's name
   * @return the comics
   */
  public List<Comic> getAllForSeries(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicRepository.findAllBySeries(name);
  }

  /**
   * Returns the list of all character names.
   *
   * @return the list of names.
   */
  public List<String> getAllCharacters() {
    log.trace("Loading all character names");
    return this.comicRepository.findDistinctCharacters();
  }

  /**
   * Returns all comics for a single character by name.
   *
   * @param name the character's name
   * @return the comics
   */
  public List<Comic> getAllForCharacter(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicRepository.findAllByCharacters(name);
  }

  /**
   * Returns the list of all team names.
   *
   * @return the list of names.
   */
  public List<String> getAllTeams() {
    log.trace("Loading all publisher names");
    return this.comicRepository.findDistinctTeams();
  }

  /**
   * Returns all comics for a single team by name.
   *
   * @param name the team's name
   * @return the comics
   */
  public List<Comic> getAllForTeam(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicRepository.findAllByTeams(name);
  }

  /**
   * Returns the list of all location names.
   *
   * @return the list of names.
   */
  public List<String> getAllLocations() {
    log.trace("Loading all location names");
    return this.comicRepository.findDistinctLocations();
  }

  /**
   * Returns all comics for a single location by name.
   *
   * @param name the location's name
   * @return the comics
   */
  public List<Comic> getAllForLocation(final String name) {
    log.trace("Loading all comics for one publisher");
    return this.comicRepository.findAllByLocations(name);
  }

  /**
   * Returns the list of all stories.
   *
   * @return the list of names.
   */
  public List<String> getAllStories() {
    log.trace("Loading all publisher names");
    return this.comicRepository.findDistinctStories();
  }

  /**
   * Returns all comics for a single publisher by name.
   *
   * @param name the publisher's name
   * @return the comics
   */
  public List<Comic> getAllForStory(final String name) {
    log.trace("Loading all comics in a story arc");
    return this.comicRepository.findAllByStories(name);
  }

  public List<String> getAllPublishersForStory(final String name) {
    log.trace("Returning all publishers for a given story");
    return this.comicRepository.findDistinctPublishersForStory(name);
  }
}
