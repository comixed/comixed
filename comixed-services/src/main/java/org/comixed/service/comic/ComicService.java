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

package org.comixed.service.comic;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.io.FileUtils;
import org.comixed.model.comic.Comic;
import org.comixed.model.tasks.TaskType;
import org.comixed.model.user.ComiXedUser;
import org.comixed.model.user.LastReadDate;
import org.comixed.repositories.ComiXedUserRepository;
import org.comixed.repositories.comic.ComicRepository;
import org.comixed.repositories.library.LastReadDatesRepository;
import org.comixed.service.task.TaskService;
import org.comixed.task.TaskException;
import org.comixed.task.adaptors.TaskAdaptor;
import org.comixed.task.encoders.RescanComicTaskEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Log4j2
public class ComicService {
  @Autowired private ComicRepository comicRepository;
  @Autowired private LastReadDatesRepository lastReadDatesRepository;
  @Autowired private TaskService taskService;
  @Autowired private ComiXedUserRepository userRepository;
  @Autowired private TaskAdaptor taskAdaptor;

  public List<Comic> getComicsUpdatedSince(final long timestamp, final int maximumResults) {
    final Date lastUpdated = new Date(timestamp);
    log.debug(
        "Getting {} comic{} updated since {}",
        maximumResults,
        maximumResults == 1 ? "" : "s",
        lastUpdated);

    final List<Comic> result =
        this.comicRepository.findAllByDateLastUpdatedGreaterThan(
            lastUpdated, PageRequest.of(0, maximumResults));

    log.debug("Returning {} comic{}", result.size(), result.size() == 1 ? "" : "s");

    return result;
  }

  @Transactional
  public Comic deleteComic(final long id) throws ComicException {
    log.debug("Marking comic for deletion: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic comic = record.get();
    log.debug("Setting deleted date");
    comic.setDateDeleted(new Date());

    log.debug("Updating comic in the database");
    comic.setDateLastUpdated(new Date());
    return this.comicRepository.save(comic);
  }

  @Transactional
  public List<Long> deleteMultipleComics(final List<Long> ids) {
    log.debug("Preparing to delete {} comic{}", ids.size(), ids.size() == 1 ? "" : "s");
    List<Long> result = new ArrayList<>();

    for (long id : ids) {
      log.debug("Fetching comic: id={}", id);
      final Optional<Comic> comic = this.comicRepository.findById(id);

      if (comic.isPresent()) {
        log.debug("Deleting comics");
        this.comicRepository.delete(comic.get());
        result.add(id);
      } else {
        log.error("No such comic");
      }
    }
    return result;
  }

  @Transactional
  public Comic updateComic(final long id, final Comic update) {
    log.debug("Updating comic: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (record.isPresent()) {
      final Comic comic = record.get();
      log.debug("Updating the comic fields");

      comic.setPublisher(update.getPublisher());
      comic.setImprint(update.getImprint());
      comic.setSeries(update.getSeries());
      comic.setVolume(update.getVolume());
      comic.setIssueNumber(update.getIssueNumber());
      comic.setSortName(update.getSortName());
      comic.setScanType(update.getScanType());
      comic.setFormat(update.getFormat());
      comic.setDateLastUpdated(new Date());

      log.debug("Saving updated comic");
      return this.comicRepository.save(comic);
    }

    log.debug("No such comic");
    return null;
  }

  public long getProcessingCount() {
    log.debug("Getting the current processing count");

    final long result = this.taskService.getTaskCount(TaskType.PROCESS_COMIC);

    log.debug("There {} record{} to be processed", result, result == 1 ? "" : "s");

    return result;
  }

  public int getRescanCount() {
    log.debug("Getting the current rescan count");

    return this.taskService.getTaskCount(TaskType.RESCAN_COMIC);
  }

  public List<LastReadDate> getLastReadDatesSince(final String email, final long timestamp) {
    log.debug("Getting last read dates for user: email={}", email);

    final ComiXedUser user = this.userRepository.findByEmail(email);

    return this.lastReadDatesRepository.findAllForUser(user.getId(), new Date(timestamp));
  }

  @Transactional
  public Comic save(final Comic comic) {
    log.debug("Saving comic: filename={}", comic.getFilename());

    comic.setDateLastUpdated(new Date());

    return this.comicRepository.save(comic);
  }

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

  public int rescanComics() {
    log.debug("Rescanning comics in the library");

    final Iterable<Comic> comics = this.comicRepository.findAll();
    int count = 0;

    for (Comic comic : comics) {
      count++;
      try {
        log.debug("Queueing comic for rescan: {}", comic.getFilename());
        RescanComicTaskEncoder encoder = this.taskAdaptor.getEncoder(TaskType.RESCAN_COMIC);

        encoder.setComic(comic);
        this.taskAdaptor.save(encoder.encode());
      } catch (TaskException error) {
        log.error("Failed to encode rescan task", error);
      }
    }

    return count;
  }

  @Transactional
  public Comic restoreComic(final long id) throws ComicException {
    log.debug("Restoring comic: id={}", id);

    final Optional<Comic> record = this.comicRepository.findById(id);

    if (!record.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic comic = record.get();

    log.debug("Restoring comic: id={} originally deleted={}", id, comic.getDateDeleted());

    log.debug("Clearing deleted date");
    comic.setDateDeleted(null);
    log.debug("Refreshing last updated date");
    comic.setDateLastUpdated(new Date());

    log.debug("Saving comic");
    return this.comicRepository.save(comic);
  }

  public Comic getComic(final long id) throws ComicException {
    log.debug("Getting comic: id={}", id);

    final Optional<Comic> comicRecord = this.comicRepository.findById(id);

    if (!comicRecord.isPresent()) {
      throw new ComicException("no such comic: id=" + id);
    }

    final Comic result = comicRecord.get();
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
      } else {
        log.debug("Did not find a next issue");
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
      } else {
        log.debug("Did not find a previous issue");
      }
    }

    log.debug("Returning comic: id={}", result.getId());
    return result;
  }

  @Transactional
  public LastReadDate markAsRead(String email, long id) throws ComicException {
    log.debug("Marking comic as read by {}: id={}", email, id);
    Comic comic = this.comicRepository.getById(id);
    if (comic == null) throw new ComicException("no such comic: id=" + id);

    ComiXedUser user = this.userRepository.findByEmail(email);
    LastReadDate lastReadDate = this.lastReadDatesRepository.getForComicAndUser(comic, user);

    if (lastReadDate == null) {
      log.debug("Creating a new last read date record");
      lastReadDate = new LastReadDate();
      lastReadDate.setUser(user);
      lastReadDate.setComic(comic);
    } else {
      log.debug("Updating last read date");
      lastReadDate.setLastRead(new Date());
    }

    log.debug("Saving last read date: {}", lastReadDate.getLastRead());
    this.lastReadDatesRepository.save(lastReadDate);

    log.debug("Returning the list of last read dates");
    return this.lastReadDatesRepository.getForComicAndUser(comic, user);
  }

  @Transactional
  public boolean markAsUnread(String email, long id) throws ComicException {
    log.debug("Marking comic as not read by {}: id={}", email, id);
    Comic comic = this.comicRepository.getById(id);
    if (comic == null) throw new ComicException("no such comic: id=" + id);

    ComiXedUser user = this.userRepository.findByEmail(email);
    LastReadDate lastReadDate = this.lastReadDatesRepository.getForComicAndUser(comic, user);

    if (lastReadDate != null) {
      log.debug("Deleting last read record for {}: id={}", email, id);
      this.lastReadDatesRepository.delete(lastReadDate);
    } else {
      log.debug("Comic is not already marked as read");
      return false;
    }

    log.debug("Returning success");
    return true;
  }

  public Comic getComic(long comicId, String email) throws ComicException {
    Comic result = this.getComic(comicId);
    ComiXedUser user = this.userRepository.findByEmail(email);

    if (user == null) {
      throw new ComicException("could not load last read date for non-existent user: " + email);
    }

    log.debug("Loading last read date for comic: user id={}", user.getId());
    LastReadDate lastRead = this.lastReadDatesRepository.getForComicAndUser(result, user);
    if (lastRead != null) {
      log.debug("Last read on {}", lastRead.getLastRead());
      result.setLastRead(lastRead.getLastRead());
    }

    return result;
  }
}
