/*
 * ComiXed - A digital comic book library management application.
 * Copyright (C) 2021, The ComiXed Project
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

package org.comixedproject.service.comicpages;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.adaptors.AdaptorException;
import org.comixedproject.adaptors.comicbooks.ComicBookAdaptor;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.adaptors.encoders.DataEncoder;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.comicpages.PublishBlockedPageRemovalAction;
import org.comixedproject.messaging.comicpages.PublishBlockedPageUpdateAction;
import org.comixedproject.messaging.library.PublishDuplicatePageListUpdateAction;
import org.comixedproject.model.comicpages.BlockedHash;
import org.comixedproject.model.comicpages.Page;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.repositories.comicpages.BlockedHashRepository;
import org.comixedproject.service.library.DuplicatePageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>BlockedHashService</code> applies business rules to instances of {@link BlockedHash}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class BlockedHashService {
  static final String PAGE_LABEL_HEADER = "Page Label";
  static final String PAGE_HASH_HEADER = "Hash Value";
  static final String PAGE_SNAPSHOT_HEADER = "Encoded Snapshot";

  @Autowired private BlockedHashRepository blockedHashRepository;
  @Autowired private CsvAdaptor csvAdaptor;
  @Autowired private PublishBlockedPageUpdateAction publishBlockedPageUpdateAction;
  @Autowired private PublishBlockedPageRemovalAction publishBlockedPageRemovalAction;
  @Autowired private PublishDuplicatePageListUpdateAction publishDuplicatePageListUpdateAction;
  @Autowired private DuplicatePageService duplicatePageService;
  @Autowired private PageService pageService;
  @Autowired private ComicBookAdaptor comicBookAdaptor;
  @Autowired private DataEncoder dataEncoder;

  /**
   * Returns all blocked pages.
   *
   * @return all blocked pages
   */
  @Transactional
  public List<BlockedHash> getAll() {
    log.debug("Loading all blocked page records");
    return this.blockedHashRepository.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the blocked page has
   * @return the blocked page
   * @throws BlockedHashException if no such record exists
   */
  @Transactional
  public BlockedHash getByHash(final String hash) throws BlockedHashException {
    log.debug("Loading blocked page by hash: {}", hash);
    final BlockedHash result = this.blockedHashRepository.findByHash(hash);

    if (result == null) {
      throw new BlockedHashException("No such blocked page: hash=" + hash);
    }

    return result;
  }

  /**
   * Retrieves the set of hashes only.
   *
   * @return the blocked page hashes
   */
  public List<String> getHashes() {
    log.debug("Loading all blocked page hashes");
    return this.blockedHashRepository.getHashes();
  }

  private void doPublishDuplicatePageUpdates() {
    try {
      log.trace("Publishing duplicate page list");
      this.publishDuplicatePageListUpdateAction.publish(
          this.duplicatePageService.getDuplicatePages());
    } catch (PublishingException error) {
      log.error("Failed to publish duplicate page list", error);
    }
  }

  /**
   * Updates the details for a blocked page.
   *
   * @param hash the page hash
   * @param blockedHash the updated details
   * @return the updated record
   */
  @Transactional
  public BlockedHash updateBlockedPage(final String hash, final BlockedHash blockedHash) {
    final BlockedHash updatedPage =
        this.doBlockPageHash(hash, blockedHash, blockedHash.getThumbnail());
    try {
      this.publishBlockedPageUpdateAction.publish(updatedPage);
    } catch (PublishingException error) {
      log.error("Failed to publish blocked page update", error);
    }
    this.doPublishDuplicatePageUpdates();
    return updatedPage;
  }

  public BlockedHash doBlockPageHash(
      final String hash, final BlockedHash source, final String thumbnail) {
    log.trace("Looking for existing blocked page record");
    BlockedHash pageRecord = this.blockedHashRepository.findByHash(hash);
    if (pageRecord == null) {
      log.trace("Creating new blocked page record");
      pageRecord = new BlockedHash("", hash, thumbnail);
    }
    if (source != null) {
      log.trace("Copying blocked page values");
      pageRecord.setLabel(source.getLabel());
    }
    log.trace("Saving updated blocked page");
    return this.blockedHashRepository.save(pageRecord);
  }

  /**
   * Adds a page type to the blocked page lis.
   *
   * @param hashes the page hashes
   */
  @Transactional
  public void blockPages(final List<String> hashes) {
    for (int index = 0; index < hashes.size(); index++) {
      try {
        final String hash = hashes.get(index);
        final Page page = this.pageService.getOneForHash(hash);
        final byte[] pageContent =
            this.comicBookAdaptor.loadPageContent(page.getComicBook(), page.getPageNumber());
        final String encodedPageContent = this.dataEncoder.encode(pageContent);

        final BlockedHash blockedHashRecord = this.doBlockPageHash(hash, null, encodedPageContent);
        this.publishBlockedPageUpdateAction.publish(blockedHashRecord);
      } catch (PublishingException | AdaptorException error) {
        log.error("Failed to publish blocked page update", error);
      }
    }
    this.doPublishDuplicatePageUpdates();
  }

  /**
   * Unblocked a set of page types by hash.
   *
   * @param hashes the hash list
   */
  @Transactional
  public void unblockPages(final List<String> hashes) {
    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      log.trace("Unblocking page hash: {}", hash);
      final BlockedHash blockedHashRecord = this.doUnblockPageHash(hash);
      if (blockedHashRecord != null) {
        log.trace("Publishing blocked page removal");
        try {
          this.publishBlockedPageRemovalAction.publish(blockedHashRecord);
        } catch (PublishingException error) {
          log.error("Failed to publish blocked page remove", error);
        }
      }
    }
    this.doPublishDuplicatePageUpdates();
  }

  public BlockedHash doUnblockPageHash(final String hash) {
    final BlockedHash entry = this.blockedHashRepository.findByHash(hash);
    if (entry == null) {
      log.trace("Page hash not blocked: {}", hash);
      return null;
    }
    log.trace("Deleting record");
    this.blockedHashRepository.delete(entry);
    return entry;
  }

  /**
   * Creates a CSV file containing the list of all blocked pages.
   *
   * @return the document
   * @throws IOException if an error occurs
   */
  public DownloadDocument createFile() throws IOException {
    log.debug("Retrieving blocked pages");
    final List<BlockedHash> entries = this.blockedHashRepository.findAll();
    final byte[] content =
        this.csvAdaptor.encodeRecords(
            entries,
            (index, model) -> {
              if (index == 0) {
                return new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER};
              } else {
                return new String[] {model.getLabel(), model.getHash(), model.getThumbnail()};
              }
            });
    return new DownloadDocument(
        String.format(
            "ComiXed Blocked Pages For %s.csv", DateFormatUtils.format(new Date(), "yyyy-MM-dd")),
        "text/csv",
        content);
  }

  /**
   * Processes a received file of blocked pages.
   *
   * @param inputStream the data stream
   * @return the updated list of blocked pages
   * @throws IOException if an error occurs with the data stream.
   */
  @Transactional
  public List<BlockedHash> uploadFile(final InputStream inputStream) throws IOException {
    this.csvAdaptor.decodeRecords(
        inputStream,
        new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER},
        (index, row) -> {
          if (index > 0) {
            final String label = row.get(0);
            final String hash = row.get(1);
            final String thumbnail = row.get(2);

            log.debug("Checking if blocked page already exists: hash={}", hash);
            var blockedPage = this.blockedHashRepository.findByHash(hash);
            if (blockedPage == null) {
              log.debug("Creating new blocked page record");
              this.doSaveRecord(label, hash, thumbnail);
            }
          }
        });
    return this.blockedHashRepository.findAll();
  }

  @Transactional
  public void doSaveRecord(final String label, final String hash, final String thumbnail) {
    final var blockedPage = new BlockedHash(label, hash, thumbnail);
    this.blockedHashRepository.save(blockedPage);
  }

  /**
   * Deletes a set of entries based on their hashes.
   *
   * @param hashes the entry hashes
   * @return the deleted entries
   */
  @Transactional
  public List<String> deleteBlockedPages(final List<String> hashes) {
    log.debug("Deleting {} blocked page entr{}", hashes.size(), hashes.size() == 1 ? "y" : "ies");
    List<String> result = new ArrayList<>();
    hashes.forEach(
        hash -> {
          log.trace("Loading blocked page for hash: {}", hash);
          final BlockedHash entry = this.blockedHashRepository.findByHash(hash);
          if (entry != null) {
            log.trace("Deleting entry: id={}", entry.getId());
            this.blockedHashRepository.delete(entry);
            result.add(entry.getHash());
            try {
              this.publishBlockedPageRemovalAction.publish(entry);
            } catch (PublishingException error) {
              log.error("Failed to publish blocked hash removed", error);
            }
          }
        });
    log.trace("Returning list of deleted blocked pages");
    return result;
  }

  /**
   * Returns if the given has is blocked.
   *
   * @param hash the page hash
   * @return true if blocked
   */
  public boolean isHashBlocked(final String hash) {
    log.trace("Finding if hash is blocked: {}", hash);
    return this.blockedHashRepository.findByHash(hash) != null;
  }

  /**
   * Returns the thumbnail for a given page hash.
   *
   * @param hash the page hash
   * @return the thumbnail content
   */
  @Transactional
  public byte[] getThumbnail(final String hash) throws BlockedHashException {
    log.debug("Loading blocked hash: {}", hash);
    final BlockedHash blockedHash = this.blockedHashRepository.findByHash(hash);
    if (blockedHash == null) {
      throw new BlockedHashException("no such blocked hash: " + hash);
    }
    return this.dataEncoder.decode(blockedHash.getThumbnail());
  }
}
