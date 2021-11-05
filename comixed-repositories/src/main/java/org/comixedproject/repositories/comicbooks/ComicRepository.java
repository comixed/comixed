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

package org.comixedproject.repositories.comicbooks;

import java.util.Date;
import java.util.List;
import org.comixedproject.model.comicbooks.Comic;
import org.comixedproject.model.comicbooks.ComicState;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComicRepository extends JpaRepository<Comic, Long> {
  /**
   * Returns all comics not read by the specified user.
   *
   * @param userId the user's id
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.id NOT IN (SELECT r.comic.id FROM LastRead r WHERE r.user.id = :userId)")
  List<Comic> findAllUnreadByUser(@Param("userId") long userId);

  /**
   * Finds a comic based on filename.
   *
   * @param filename the filename
   * @return the comic
   */
  Comic findByFilename(String filename);

  /**
   * Returns all comic entries for the given series name.
   *
   * @param series the series name
   * @return the list of comics
   */
  List<Comic> findBySeries(String series);

  @Query("SELECT c FROM Comic c LEFT JOIN FETCH c.pages WHERE c.id = :id")
  Comic getById(@Param("id") long id);

  @Query(
      "SELECT c FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate <= :coverDate ORDER BY c.coverDate,c.issueNumber DESC")
  List<Comic> findIssuesBeforeComic(
      @Param("series") final String series,
      @Param("volume") final String volume,
      @Param("issueNumber") final String issueNumber,
      @Param("coverDate") final Date coverDate);

  @Query(
      "SELECT c FROM Comic c WHERE c.series = :series AND c.volume = :volume AND c.issueNumber <> :issueNumber AND c.coverDate >= :coverDate ORDER BY c.coverDate,c.issueNumber ASC")
  List<Comic> findIssuesAfterComic(
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issueNumber,
      @Param("coverDate") Date coverDate);

  @Query("SELECT c FROM Comic c ORDER BY c.id")
  List<Comic> findComicsToMove(PageRequest page);

  /**
   * Returns a page of {@link Comic} objects with an id greater than the supplied threshold.
   *
   * @param threshold the threshold id
   * @param page the page parameter
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.id > :threshold ORDER BY c.id")
  List<Comic> findComicsWithIdGreaterThan(@Param("threshold") Long threshold, Pageable page);

  /**
   * Returns all comics containing a page with the given hash.
   *
   * @param hash the page hash
   * @return the comic list
   */
  @Query("SELECT c FROM Comic c WHERE c IN (SELECT p.comic FROM Page p WHERE p.hash = :hash)")
  List<Comic> findComicsForPageHash(@Param("hash") String hash);

  /**
   * Loads all comics, ordered by date added.
   *
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c ORDER BY c.dateAdded")
  List<Comic> loadComicList();

  /**
   * Loads all comics with the given state, ordered by last modified date.
   *
   * @param state the state
   * @return the comics
   */
  @Query("SELECT c FROM Comic c WHERE c.comicState = :state ORDER BY c.lastModifiedOn")
  List<Comic> findForState(@Param("state") ComicState state);

  /**
   * Returns unprocessed comics that have their file loaded flag turned off.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = false ORDER BY c.lastModifiedOn")
  List<Comic> findUnprocessedComicsWithoutContent();

  /**
   * Returns unprocessed comics that have their blocked pages marked flag turned off.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = false ORDER BY c.lastModifiedOn")
  List<Comic> findUnprocessedComicsForMarkedPageBlocking();

  /**
   * Returns unprocessed comics without file details.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true AND c.id NOT IN (SELECT d.comic.id FROM ComicFileDetails d)")
  List<Comic> findUnprocessedComicsWithoutFileDetails();

  /**
   * Returns unprocessed comics that have been fully processed.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c LEFT JOIN FETCH c.fileDetails fd WHERE c.comicState = 'UNPROCESSED' AND c.fileContentsLoaded = true AND c.blockedPagesMarked = true ORDER BY c.lastModifiedOn")
  List<Comic> findProcessedComics();

  /**
   * Returns comics that are waiting to have their metadata update flag set.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.comicState = 'CHANGED' AND c.updateMetadata = true ORDER BY c.lastModifiedOn")
  List<Comic> findComicsWithMetadataToUpdate();

  /**
   * Returns comics that are in the deleted state.
   *
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.comicState = 'DELETED' ORDER BY c.lastModifiedOn")
  List<Comic> findComicsMarkedForDeletion();

  /**
   * Returns all comics with the consolidating flag set.
   *
   * @return the list of comics
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.consolidating = true AND c.dateDeleted IS NULL ORDER BY c.lastModifiedOn")
  List<Comic> findComicsToBeMoved();

  /**
   * Returns a single comic with all reading lists in which it is found.
   *
   * @param id the record id
   * @return the comic
   */
  @Query("SELECT c FROM Comic c LEFT JOIN FETCH c.readingLists l WHERE c.id = :id")
  Comic getByIdWithReadingLists(@Param("id") long id);

  /**
   * Returns comics that are marked to be recreated.
   *
   * @return the list of comics
   */
  @Query("SELECT c FROM Comic c WHERE c.recreating = true ORDER BY c.lastModifiedOn")
  List<Comic> findComicsToRecreate();

  /**
   * Returns a single comic that matches the given criteria.
   *
   * @param publisher the publisher
   * @param series the series
   * @param volume the volume
   * @param issuesNumber the issue number
   * @return the comic
   */
  @Query(
      "SELECT c FROM Comic c WHERE c.publisher = :publisher AND c.series = :series AND c.volume = :volume and c.issueNumber = :issueNumber")
  Comic findComic(
      @Param("publisher") String publisher,
      @Param("series") String series,
      @Param("volume") String volume,
      @Param("issueNumber") String issuesNumber);

  /**
   * Returns the distinct list of publisher names.
   *
   * @return the publisher names
   */
  @Query("SELECT DISTINCT c.publisher FROM Comic c")
  List<String> findDistinctPublishers();

  /**
   * Returns all comics with a given publisher.
   *
   * @param name the publisher's name
   * @return the comics
   */
  List<Comic> findAllByPublisher(String name);

  /**
   * Returns the distinct list of series names.
   *
   * @return the series names
   */
  @Query("SELECT DISTINCT c.series FROM Comic c")
  List<String> findDistinctSeries();

  /**
   * Returns all comics with a given series.
   *
   * @param name the series's name
   * @return the comics
   */
  List<Comic> findAllBySeries(String name);

  /**
   * Returns the distinct list of character names.
   *
   * @return the character names
   */
  @Query("SELECT DISTINCT(ch) FROM Comic c JOIN c.characters ch")
  List<String> findDistinctCharacters();

  /**
   * Returns all comics with a given character.
   *
   * @param name the character's name
   * @return the comics
   */
  List<Comic> findAllByCharacters(String name);

  /**
   * Returns the distinct list of team names.
   *
   * @return the team names
   */
  @Query("SELECT DISTINCT(t) FROM Comic c JOIN c.teams t")
  List<String> findDistinctTeams();

  /**
   * Returns all comics with a given team.
   *
   * @param name the team's name
   * @return the comics
   */
  List<Comic> findAllByTeams(String name);

  /**
   * Returns the distinct list of location names.
   *
   * @return the location names
   */
  @Query("SELECT DISTINCT(l) FROM Comic c JOIN c.locations l")
  List<String> findDistinctLocations();

  /**
   * Returns all comics with a given location.
   *
   * @param name the location's name
   * @return the comics
   */
  List<Comic> findAllByLocations(String name);

  /**
   * Returns the distinct list of story names.
   *
   * @return the story names
   */
  @Query("SELECT DISTINCT(s) FROM Comic c JOIN c.stories s")
  List<String> findDistinctStories();

  /**
   * Returns all comics with a given story.
   *
   * @param name the story's name
   * @return the comics
   */
  List<Comic> findAllByStories(String name);

  /**
   * Returns the distinct list of publishers who have a story with given name.
   *
   * @param name the story name
   * @return the publishers
   */
  @Query("SELECT DISTINCT c.publisher FROM Comic c JOIN c.stories WHERE :name MEMBER OF c.stories")
  List<String> findDistinctPublishersForStory(@Param("name") String name);
}
