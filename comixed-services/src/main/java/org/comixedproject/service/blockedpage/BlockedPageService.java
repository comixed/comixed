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

package org.comixedproject.service.blockedpage;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang.time.DateFormatUtils;
import org.comixedproject.adaptors.csv.CsvAdaptor;
import org.comixedproject.messaging.PublishingException;
import org.comixedproject.messaging.blockedpage.PublishBlockedPageRemovalAction;
import org.comixedproject.messaging.blockedpage.PublishBlockedPageUpdateAction;
import org.comixedproject.messaging.library.PublishDuplicatePageListUpdateAction;
import org.comixedproject.model.blockedpage.BlockedPage;
import org.comixedproject.model.net.DownloadDocument;
import org.comixedproject.repositories.blockedpage.BlockedPageRepository;
import org.comixedproject.service.comicbooks.PageService;
import org.comixedproject.service.library.DuplicatePageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * <code>BlockedPageService</code> applies business rules to instances of {@link BlockedPage}.
 *
 * @author Darryl L. Pierce
 */
@Component
@Log4j2
public class BlockedPageService {
  static final String PAGE_LABEL_HEADER = "Page Label";
  static final String PAGE_HASH_HEADER = "Hash Value";
  static final String PAGE_SNAPSHOT_HEADER = "Encoded Snapshot";

  @Autowired private BlockedPageRepository blockedPageRepository;
  @Autowired private CsvAdaptor csvAdaptor;
  @Autowired private PublishBlockedPageUpdateAction publishBlockedPageUpdateAction;
  @Autowired private PublishBlockedPageRemovalAction publishBlockedPageRemovalAction;
  @Autowired private PageService pageService;
  @Autowired private PublishDuplicatePageListUpdateAction publishDuplicatePageListUpdateAction;
  @Autowired private DuplicatePageService duplicatePageService;

  /**
   * Returns all blocked pages.
   *
   * @return all blocked pages
   */
  public List<BlockedPage> getAll() {
    log.debug("Loading all blocked page records");
    return this.blockedPageRepository.getAll();
  }

  /**
   * Returns a single blocked page by its hash.
   *
   * @param hash the blocked page has
   * @return the blocked page
   * @throws BlockedPageException if no such record exists
   */
  public BlockedPage getByHash(final String hash) throws BlockedPageException {
    log.debug("Loading blocked page by hash: {}", hash);
    final BlockedPage result = this.blockedPageRepository.findByHash(hash);

    if (result == null) {
      throw new BlockedPageException("No such blocked page: hash=" + hash);
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
    return this.blockedPageRepository.getHashes();
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
   * @param blockedPage the updated details
   * @return the updated record
   * @throws BlockedPageException if the hash is invalid
   */
  @Transactional
  public BlockedPage updateBlockedPage(final String hash, final BlockedPage blockedPage)
      throws BlockedPageException {
    final BlockedPage updatedPage = this.doBlockPageHash(hash, blockedPage);
    try {
      this.publishBlockedPageUpdateAction.publish(updatedPage);
    } catch (PublishingException error) {
      log.error("Failed to publish blocked page update", error);
    }
    this.doPublishDuplicatePageUpdates();
    return updatedPage;
  }

  public BlockedPage doBlockPageHash(final String hash, final BlockedPage source) {
    log.trace("Looking for existing blocked page record");
    BlockedPage pageRecord = this.blockedPageRepository.findByHash(hash);
    if (pageRecord == null) {
      log.trace("Creating new blocked page record");
      pageRecord = new BlockedPage("", hash, "");
    }
    if (source != null) {
      log.trace("Copying blocked page values");
      pageRecord.setLabel(source.getLabel());
    }
    log.trace("Saving updated blocked page");
    return this.blockedPageRepository.save(pageRecord);
  }

  /**
   * Adds a page type to the blocked page lis.
   *
   * @param hashes the page hashes
   */
  @Transactional
  public void blockPages(final List<String> hashes) {
    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      final BlockedPage blockedPageRecord = this.doBlockPageHash(hash, null);
      try {
        this.publishBlockedPageUpdateAction.publish(blockedPageRecord);
      } catch (PublishingException error) {
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
      final BlockedPage blockedPageRecord = this.doUnblockPageHash(hash);
      if (blockedPageRecord != null) {
        log.trace("Publishing blocked page removal");
        try {
          this.publishBlockedPageRemovalAction.publish(blockedPageRecord);
        } catch (PublishingException error) {
          log.error("Failed to publish blocked page remove", error);
        }
      }
    }
    this.doPublishDuplicatePageUpdates();
  }

  public BlockedPage doUnblockPageHash(final String hash) {
    final BlockedPage entry = this.blockedPageRepository.findByHash(hash);
    if (entry == null) {
      log.trace("Page hash not blocked: {}", hash);
      return null;
    }
    log.trace("Deleting record");
    this.blockedPageRepository.delete(entry);
    return entry;
  }

  /**
   * Creates a CSV file containing the list of all blocked pages.
   *
   * @return the document
   */
  public DownloadDocument createFile() throws IOException {
    log.debug("Retrieving blocked pages");
    final List<BlockedPage> entries = this.blockedPageRepository.findAll();
    final byte[] content =
        this.csvAdaptor.encodeRecords(
            entries,
            (index, model) -> {
              if (index == 0) {
                return new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER};
              } else {
                return new String[] {model.getLabel(), model.getHash(), model.getSnapshot()};
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
  public List<BlockedPage> uploadFile(final InputStream inputStream) throws IOException {
    this.csvAdaptor.decodeRecords(
        inputStream,
        new String[] {PAGE_LABEL_HEADER, PAGE_HASH_HEADER, PAGE_SNAPSHOT_HEADER},
        (index, row) -> {
          if (index > 0) {
            final String label = row.get(0);
            final String hash = row.get(1);
            final String snapshot = row.get(2);

            log.debug("Checking if blocked page already exists: hash={}", hash);
            var blockedPage = this.blockedPageRepository.findByHash(hash);
            if (blockedPage == null) {
              log.debug("Creating new blocked page record");
              this.doSaveRecord(label, hash, snapshot);
            }
          }
        });
    return this.blockedPageRepository.findAll();
  }

  @Transactional
  public void doSaveRecord(final String label, final String hash, final String snapshot) {
    final var blockedPage = new BlockedPage(label, hash, snapshot);
    this.blockedPageRepository.save(blockedPage);
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
          final BlockedPage entry = this.blockedPageRepository.findByHash(hash);
          if (entry != null) {
            log.trace("Deleting entry: id={}", entry.getId());
            this.blockedPageRepository.delete(entry);
            result.add(entry.getHash());
          }
        });
    log.trace("Returning list of deleted blocked pages");
    return result;
  }

  /**
   * Sets the deletion flag for pages with one of a list of hashes.
   *
   * @param hashes the page hashes
   * @param deleted the deleted state
   * @return the number of pages updated
   */
  @Transactional
  public int setBlockedPageDeletionFlag(final List<String> hashes, final boolean deleted) {
    int result = 0;

    for (int index = 0; index < hashes.size(); index++) {
      final String hash = hashes.get(index);
      if (deleted) {
        log.trace("Marking pages with hash for deletion: {}", hash);
        result += this.pageService.deleteAllWithHash(hash);
      } else {
        log.trace("Clearing pages with hash for deletion: {}", hash);
        result += this.pageService.undeleteAllWithHash(hash);
      }
    }

    log.debug(
        "{} {} page{} for deletion",
        deleted ? "Marked" : "Cleared",
        result,
        result == 1 ? "" : "s");
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
    return this.blockedPageRepository.findByHash(hash) != null;
  }
}
